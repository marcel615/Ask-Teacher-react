/**
 * Opt-in HTTP integration against the isolated ASK-14 backend fixture only.
 * ASK14_BACKEND_URL=http://127.0.0.1:18080/api
 * ASK14_REDIS_CONTAINER=askteacher-ask14-link-redis enables the pause/unpause check.
 * Node shims cover browser cookies, locks and channel only; HTTP responses are real.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID, createHmac, createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import axios from 'axios'
import api from '../src/api/api.ts'
import { signup, login } from '../src/api/authApi.ts'
import { createPost, getPost, getPosts, updatePost, deletePost, postFormData } from '../src/api/postApi.ts'
import { getCategories } from '../src/api/postCategoryApi.ts'
import { authSession } from '../src/auth/authSession.ts'
import { createSession } from '../src/auth/session.ts'

const baseURL = process.env.ASK14_BACKEND_URL
const origin = 'http://localhost:5173'
// Public, isolated test-profile key from Backend src/test/resources/application-test.yaml.
const testSigningKey = 'test-only-q8MzV3RaL5NcH2PtJ7XyK4UwZ9Gf'

function browserEnvironment() {
    const storage = new Map()
    let queue = Promise.resolve()
    return {
        localStorage: {
            getItem: key => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value)
        },
        navigator: { locks: { request: async (_name, { signal }, action) => {
            const previous = queue
            let release
            queue = new Promise(resolve => { release = resolve })
            await previous
            try {
                if (signal.aborted) throw new Error('Test lock aborted')
                return await action()
            } finally { release() }
        } } },
        BroadcastChannel: class { postMessage() {} },
        addEventListener() {}
    }
}

function attachBrowserCookies(client, observations) {
    const cookies = new Map()
    let nextBearer
    const requestId = client.interceptors.request.use(config => {
        config.headers.set('Origin', origin)
        const path = new URL(client.getUri(config)).pathname
        const selected = [...cookies.entries()].filter(([, cookie]) => (
            path === cookie.path || path.startsWith(cookie.path.endsWith('/') ? cookie.path : `${cookie.path}/`)
        ))
        if (selected.length) config.headers.set('Cookie', selected.map(([name, cookie]) => `${name}=${cookie.value}`).join('; '))
        if (nextBearer && path.startsWith('/api/posts/')) {
            config.headers.set('Authorization', `Bearer ${nextBearer}`)
            nextBearer = undefined
        }
        return config
    })
    const observe = response => {
        const setCookies = response.headers['set-cookie'] || []
        for (const header of setCookies) {
            const [pair, ...attributes] = header.split(';').map(part => part.trim())
            const separator = pair.indexOf('=')
            const name = pair.slice(0, separator)
            const value = pair.slice(separator + 1)
            const path = attributes.find(part => /^path=/i.test(part))?.slice(5) || '/'
            if (!value || attributes.some(part => /^max-age=0$/i.test(part))) cookies.delete(name)
            else cookies.set(name, { value, path })
        }
        observations.push({
            path: new URL(client.getUri(response.config)).pathname,
            method: response.config.method,
            status: response.status,
            credential: response.config.withCredentials === true,
            csrf: response.config.headers.has('X-XSRF-TOKEN'),
            cacheControl: response.headers['cache-control'],
            cookieAttributes: setCookies.map(header => header.slice(header.indexOf(';') + 1))
        })
        return response
    }
    const responseId = client.interceptors.response.use(observe, error => {
        if (error.response) observe(error.response)
        return Promise.reject(error)
    })
    return {
        cookies,
        expireNextRequest: token => { nextBearer = expiredToken(token) },
        detach: () => { client.interceptors.request.eject(requestId); client.interceptors.response.eject(responseId) }
    }
}

function expiredToken(token) {
    const [encodedHeader, encodedPayload] = token.split('.')
    const claims = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    const now = Math.floor(Date.now() / 1000)
    const payload = Buffer.from(JSON.stringify({ ...claims, iat: now - 120, exp: now - 60 })).toString('base64url')
    const content = `${encodedHeader}.${payload}`
    return `${content}.${createHmac('sha256', testSigningKey).update(content).digest('base64url')}`
}

async function statusOf(action, expected) {
    try {
        const result = await action()
        assert.equal(expected, 200, 'Expected HTTP failure but the request succeeded')
        return result
    } catch (error) {
        if (!error.response) throw error
        assert.equal(error.response.status, expected, 'HTTP status')
        return error.response
    }
}

async function directLogin(client, credentials) {
    const csrf = await client.get('/auth/csrf', { withCredentials: true })
    const response = await client.post('/auth/login', credentials, {
        withCredentials: true, headers: { 'X-XSRF-TOKEN': csrf.data.token }
    })
    await client.get('/auth/csrf', { withCredentials: true })
    return response.data
}

function safeError(error) {
    // Never let node:test print Axios config, cookies, passwords or Bearer values.
    if (axios.isAxiosError(error)) {
        return new Error(`Actual backend HTTP ${error.response?.status ?? 'connection failure'} at ${error.config?.method} ${error.config?.url}`)
    }
    return error
}

test('ASK-14 actual Backend HTTP link', {
    skip: !baseURL && 'Set ASK14_BACKEND_URL to opt in; no backend requests were sent',
    timeout: 120000
}, async t => {
    assert.equal(baseURL, 'http://127.0.0.1:18080/api', 'Only the dedicated local ASK-14 fixture is allowed')
    const previousBaseURL = api.defaults.baseURL
    const previousWindow = globalThis.window
    api.defaults.baseURL = baseURL
    globalThis.window = browserEnvironment()
    const writerCalls = []
    const writerBrowser = attachBrowserCookies(api, writerCalls)
    const readerHttp = axios.create({ baseURL, timeout: 10000 })
    const readerCalls = []
    const readerBrowser = attachBrowserCookies(readerHttp, readerCalls)
    const readerEnvironment = browserEnvironment()
    const reader = createSession({ transport: config => readerHttp.request(config), environment: () => readerEnvironment })
    const anonymous = axios.create({ baseURL, timeout: 10000, headers: { Origin: origin } })
    const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
    const password = `Ask14-${randomUUID()}`
    const writerCredentials = { email: `ask14-w-${suffix}@example.test`, password }
    const readerCredentials = { email: `ask14-r-${suffix}@example.test`, password }
    let postId
    const check = (name, action) => t.test(name, async () => {
        try { await action() } catch (error) { throw safeError(error) }
    })
    try {
        await check('actual signup/category modules and CSRF cookie/login sequence', async () => {
            await signup({ ...writerCredentials, nickname: `writer-${suffix}` })
            await signup({ ...readerCredentials, nickname: `reader-${suffix}` })
            const categories = await getCategories()
            assert.ok(Array.isArray(categories) && categories.length > 0, 'Backend category initializer must provide a category')
            const beforeLogin = writerCalls.length
            await login(writerCredentials)
            assert.deepEqual(writerCalls.slice(beforeLogin).map(call => [call.path, call.method, call.status]), [
                ['/api/auth/csrf', 'get', 200], ['/api/auth/login', 'post', 200], ['/api/auth/csrf', 'get', 200]
            ])
            assert.ok(writerCalls.slice(beforeLogin).every(call => call.credential))
            assert.ok(writerCalls[beforeLogin + 1].csrf)
            assert.ok(writerCalls[beforeLogin + 1].cookieAttributes.some(attributes => /HttpOnly/i.test(attributes) && /Path=\/api\/auth/i.test(attributes)))
            assert.ok(writerBrowser.cookies.has('refreshToken'))
            await reader.login(readerCredentials)
            const created = await createPost({ categoryId: categories[0].id, title: `ASK14 ${suffix}`, content: 'isolated actual HTTP fixture' })
            assert.ok(Number.isInteger(created.postId))
            postId = created.postId
            assert.ok((await getPosts()).some(post => post.postId === postId))
        })
        assert.ok(postId, 'Setup must create a test-only post before authorization checks')

        await check('writer true, reader/anonymous false are required booleans and detail is no-store', async () => {
            const writerPost = await getPost(postId)
            const readerResponse = await reader.request({ method: 'get', url: `/posts/${postId}` }, { publicFallback: true })
            const anonymousResponse = await anonymous.get(`/posts/${postId}`)
            for (const value of [writerPost.isAuthor, readerResponse.data.isAuthor, anonymousResponse.data.isAuthor]) {
                assert.equal(typeof value, 'boolean')
            }
            assert.equal(writerPost.isAuthor, true)
            assert.equal(readerResponse.data.isAuthor, false)
            assert.equal(anonymousResponse.data.isAuthor, false)
            assert.match(writerCalls.at(-1).cacheControl, /no-store/i)
            assert.match(readerResponse.headers['cache-control'], /no-store/i)
            assert.match(anonymousResponse.headers['cache-control'], /no-store/i)
        })

        await check('actual FE multipart update; reader PATCH/DELETE return 403 without mutation or refresh', async () => {
            const categories = await getCategories()
            await updatePost(postId, { categoryId: categories[0].id, title: `updated ${suffix}`, content: 'writer update' })
            const before = await getPost(postId)
            const refreshes = readerCalls.filter(call => call.path === '/api/auth/refresh').length
            await statusOf(() => reader.request({ method: 'patch', url: `/posts/${postId}`, data: postFormData({ categoryId: categories[0].id, title: 'forbidden', content: 'forbidden' }) }), 403)
            await statusOf(() => reader.request({ method: 'delete', url: `/posts/${postId}` }), 403)
            const after = await getPost(postId)
            assert.equal(after.title, before.title)
            assert.equal(after.content, before.content)
            assert.equal(readerCalls.filter(call => call.path === '/api/auth/refresh').length, refreshes)
            assert.equal(reader.getSnapshot().status, 'authenticated')
        })

        await check('actual expired JWT 401 recovers through real refresh and retries the detail', async () => {
            writerBrowser.expireNextRequest(authSession.getSnapshot().accessToken)
            const before = writerCalls.length
            const result = await getPost(postId)
            assert.equal(result.isAuthor, true)
            assert.deepEqual(writerCalls.slice(before).map(call => [call.path, call.status]), [
                [`/api/posts/${postId}`, 401], ['/api/auth/csrf', 200], ['/api/auth/refresh', 200],
                ['/api/auth/csrf', 200], [`/api/posts/${postId}`, 200]
            ])
        })

        await check('real revoked session rejects refresh then FE reloads public detail anonymously', async () => {
            const replacement = axios.create({ baseURL, timeout: 10000 })
            const replacementBrowser = attachBrowserCookies(replacement, [])
            try { await directLogin(replacement, writerCredentials) }
            finally { replacementBrowser.detach() }
            const before = writerCalls.length
            const result = await getPost(postId)
            assert.equal(result.isAuthor, false)
            assert.equal(authSession.getSnapshot().status, 'anonymous')
            const outcomes = writerCalls.slice(before).map(call => [call.path, call.status])
            assert.ok(outcomes.some(([path, status]) => path === '/api/auth/refresh' && status === 401))
            assert.deepEqual(outcomes.at(-1), [`/api/posts/${postId}`, 200])
            await login(writerCredentials)
        })

        await check('missing detail is 404 and CSRF forgery is 403', async () => {
            await statusOf(() => getPost(9223372036854775807n.toString()), 404)
            await statusOf(() => readerHttp.post('/auth/login', readerCredentials, { withCredentials: true }), 403)
        })

        await check('credential CORS preflight permits configured origin and rejects a different origin', async () => {
            const headers = { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,x-xsrf-token' }
            const allowed = await anonymous.options('/auth/login', { headers })
            assert.equal(allowed.headers['access-control-allow-origin'], origin)
            assert.equal(allowed.headers['access-control-allow-credentials'], 'true')
            const denied = await statusOf(() => anonymous.options('/auth/login', { headers: { ...headers, Origin: 'http://unapproved.example.test' } }), 403)
            assert.equal(denied.headers['access-control-allow-origin'], undefined)
        })

        if (process.env.ASK14_REDIS_CONTAINER) {
            await check('dedicated Redis outage returns real 503; FE keeps outage state and recovers manually', async () => {
                const container = process.env.ASK14_REDIS_CONTAINER
                assert.equal(container, 'askteacher-ask14-link-redis')
                const details = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8' }))[0]
                assert.equal(details.Name, '/askteacher-ask14-link-redis')
                assert.ok(details.NetworkSettings.Ports['6379/tcp'].some(port => port.HostIp === '127.0.0.1' && port.HostPort === '16379'))
                const keyVersion = createHash('sha256').update(testSigningKey).digest('base64url').slice(0, 16)
                const testUserKey = `auth:session:${keyVersion}:${authSession.getSnapshot().userId}`
                const rotationCount = () => {
                    const value = execFileSync('docker', ['exec', container, 'redis-cli', 'HGET', testUserKey, 'count'], { encoding: 'utf8' }).trim()
                    return value === '' ? null : Number(value)
                }
                const rotationsBeforePause = rotationCount()
                assert.ok(Number.isInteger(rotationsBeforePause), 'The isolated writer session must exist')
                const cookieBeforePause = writerBrowser.cookies.get('refreshToken')?.value
                let paused = false
                try {
                    execFileSync('docker', ['pause', container], { stdio: 'pipe' })
                    paused = true
                    const detailError = await statusOf(() => getPost(postId), 503)
                    assert.equal(detailError.data.isAuthor, undefined, 'Outage must reject detail, not return author success')
                    await statusOf(() => authSession.restore(), 503)
                    assert.equal(authSession.getSnapshot().status, 'error')
                    assert.ok(writerBrowser.cookies.get('refreshToken')?.value === cookieBeforePause, '503 must preserve the browser refresh cookie')
                    const offline = await anonymous.get(`/posts/${postId}`)
                    assert.equal(offline.data.isAuthor, false)
                } finally {
                    if (paused) execFileSync('docker', ['unpause', container], { stdio: 'pipe' })
                }
                let rotationsAfterResume = rotationCount()
                for (let attempt = 0; attempt < 5 && rotationsAfterResume === rotationsBeforePause; attempt += 1) {
                    await delay(50)
                    rotationsAfterResume = rotationCount()
                }
                const beforeManualRecovery = writerCalls.length
                for (let attempt = 0; attempt < 5; attempt += 1) {
                    try {
                        await authSession.restore({ manual: true })
                        break
                    } catch (error) {
                        if (error.response?.status === 401) {
                            assert.equal(authSession.getSnapshot().status, 'anonymous')
                            break
                        }
                        if (error.response?.status !== 503 || attempt === 4) throw error
                        assert.equal(authSession.getSnapshot().status, 'error')
                        await delay(300)
                    }
                }
                const recoveryStatuses = writerCalls.slice(beforeManualRecovery)
                    .filter(call => call.path === '/api/auth/refresh')
                    .map(call => call.status)
                assert.ok(recoveryStatuses.length > 0, 'Manual retry must reach the actual backend')
                const finalRecoveryStatus = recoveryStatuses.at(-1)
                if (finalRecoveryStatus === 401) {
                    assert.equal(authSession.getSnapshot().status, 'anonymous')
                    assert.equal(authSession.getSnapshot().accessToken, null)
                    const refreshCount = writerCalls.filter(call => call.path === '/api/auth/refresh').length
                    await authSession.restore({ manual: true })
                    assert.equal(writerCalls.filter(call => call.path === '/api/auth/refresh').length, refreshCount, 'Rejected refresh must not automatically repeat')
                    await login(writerCredentials)
                } else {
                    assert.equal(finalRecoveryStatus, 200)
                }
                assert.equal(authSession.getSnapshot().status, 'authenticated')
                assert.equal((await getPost(postId)).isAuthor, true)
                t.diagnostic(`Redis outage: detail/refresh 503, cookie preserved, rotation count ${rotationsBeforePause}->${rotationsAfterResume}; manual refresh HTTP ${recoveryStatuses.join(',')}; ${finalRecoveryStatus === 401 ? 'explicit re-login' : 'refresh'} restored writer authorization.`)
            })
        } else {
            await t.test('Redis outage check', { skip: 'Set ASK14_REDIS_CONTAINER to opt in; outage not verified' }, () => {})
        }

        await check('actual FE delete is 204; logout 204 clears refresh cookie and local authentication', async () => {
            await deletePost(postId)
            assert.equal(writerCalls.at(-1).status, 204)
            postId = undefined
            await authSession.logout()
            assert.equal(authSession.getSnapshot().status, 'anonymous')
            assert.equal(authSession.getSnapshot().accessToken, null)
            assert.equal(writerBrowser.cookies.has('refreshToken'), false)
            assert.ok(writerCalls.some(call => call.path === '/api/auth/logout' && call.status === 204))
            await reader.logout()
        })
        t.diagnostic('Real HTTP responses verified; browser cookie/lock/channel shims only. Chrome UI, real multi-tab ordering and React Query cancellation were not exercised.')
    } catch (error) {
        throw safeError(error)
    } finally {
        if (postId) {
            try { await login(writerCredentials); await deletePost(postId); await authSession.logout() } catch { /* isolated H2 is removed with the fixture */ }
        }
        readerBrowser.detach()
        writerBrowser.detach()
        api.defaults.baseURL = previousBaseURL
        if (previousWindow === undefined) delete globalThis.window
        else globalThis.window = previousWindow
    }
})
