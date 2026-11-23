import test from 'node:test'
import assert from 'node:assert/strict'
import { createSession, tokenSubject, errorMessage } from '../src/auth/session.js'
import { postFormData } from '../src/api/postApi.ts'
import { postKeys } from '../src/api/queryKeys.ts'
import { QueryClient } from '@tanstack/react-query'

const jwt = user => `header.${btoa(JSON.stringify({ sub: String(user) }))}.signature`
const failure = status => Object.assign(new Error(`HTTP ${status}`), { response: { status, data: { message: `server ${status}` } } })
const deferred = () => {
    let resolve
    const promise = new Promise(done => { resolve = done })
    return { promise, resolve }
}
function browserGroup() {
    const store = new Map()
    const channels = new Set()
    const storageListeners = new Set()
    let queue = Promise.resolve()
    return () => ({
        navigator: { locks: { request: async (_name, { signal }, action) => {
            const previous = queue
            const done = deferred()
            queue = done.promise
            await previous
            try { if (signal.aborted) throw new Error('aborted'); return await action() }
            finally { done.resolve() }
        } } },
        localStorage: {
            getItem: key => store.get(key) ?? null,
            setItem: (key, value) => store.set(key, value)
        },
        BroadcastChannel: class {
            constructor() { channels.add(this) }
            postMessage(data) {
                for (const other of channels) if (other !== this) other.onmessage?.({ data })
            }
        },
        addEventListener(name, listener) {
            if (name === 'storage') storageListeners.add(listener)
        },
        dispatchStorage() {
            for (const listener of storageListeners) listener({ key: 'askteacher.auth.coordination.v1' })
        }
    })
}
function server() {
    const calls = []
    let csrf = 0
    let user = '1'
    let refreshError
    let logoutError
    let loginError
    let refreshGate
    let postGate
    let expired = false
    let refreshActive = 0
    let maxRefreshActive = 0
    const transport = async config => {
        calls.push(config)
        if (config.url === '/auth/csrf') {
            assert.equal(config.withCredentials, true)
            return { data: { token: `csrf-${++csrf}`, headerName: 'X-XSRF-TOKEN' } }
        }
        if (config.url.startsWith('/auth/')) {
            assert.equal(config.withCredentials, true)
            assert.equal(config.headers['X-XSRF-TOKEN'], `csrf-${csrf}`)
        }
        if (config.url === '/auth/login') {
            if (loginError) throw loginError
            user = config.data.email === 'two@example.test' ? '2' : '1'
            return { data: { accessToken: jwt(user), tokenType: 'Bearer', expiresIn: 900 } }
        }
        if (config.url === '/auth/refresh') {
            refreshActive += 1
            maxRefreshActive = Math.max(maxRefreshActive, refreshActive)
            try {
                if (refreshGate) await refreshGate.promise
                if (refreshError) throw refreshError
                expired = false
                return { data: { accessToken: jwt(user), tokenType: 'Bearer', expiresIn: 900 } }
            } finally { refreshActive -= 1 }
        }
        if (config.url === '/auth/logout') {
            if (logoutError) throw logoutError
            return { status: 204, data: '' }
        }
        if (postGate) await postGate.promise
        if (expired && config.headers.Authorization) throw failure(401)
        return { data: { title: 'question', isAuthor: Boolean(config.headers.Authorization) } }
    }
    return {
        calls, transport,
        set refreshError(value) { refreshError = value },
        set logoutError(value) { logoutError = value },
        set loginError(value) { loginError = value },
        set refreshGate(value) { refreshGate = value },
        set postGate(value) { postGate = value },
        set expired(value) { expired = value },
        get maxRefreshActive() { return maxRefreshActive }
    }
}
const login = session => session.login({ email: 'one@example.test', password: 'test-only' })

test('CSRF credential sequence, token stays in memory, login and logout', async () => {
    const backend = server()
    const browser = browserGroup()()
    const session = createSession({ transport: backend.transport, environment: () => browser })
    await login(session)
    assert.deepEqual(backend.calls.map(call => call.url), ['/auth/csrf', '/auth/login', '/auth/csrf'])
    assert.equal(session.getSnapshot().userId, '1')
    const record = browser.localStorage.getItem('askteacher.auth.coordination.v1')
    assert.equal(record.includes(jwt('1')), false)
    await session.request({ method: 'post', url: '/posts', data: postFormData({ categoryId: 1, title: 'x', content: 'y', userId: 99 }) })
    assert.equal(backend.calls.at(-1).headers.Authorization, `Bearer ${jwt('1')}`)
    assert.deepEqual([...backend.calls.at(-1).data.keys()], ['categoryId', 'title', 'content'])
    await session.logout()
    assert.equal(session.getSnapshot().status, 'anonymous')
    assert.equal(session.getSnapshot().accessToken, null)
})

test('concurrent expired requests share one refresh and retry each request once', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    await login(session)
    backend.expired = true
    const responses = await Promise.all([1, 2, 3].map(id => session.request({ method: 'get', url: `/posts/${id}` })))
    assert.equal(responses.length, 3)
    assert.equal(backend.calls.filter(call => call.url === '/auth/refresh').length, 1)
})

test('two tabs serialize cookie operations and accept the current token without refresh ping-pong', async () => {
    const backend = server()
    const environment = browserGroup()
    const first = createSession({ transport: backend.transport, environment })
    const second = createSession({ transport: backend.transport, environment })
    await Promise.all([first.restore(), second.restore()])
    assert.equal(backend.maxRefreshActive, 1)
    assert.equal(backend.calls.filter(call => call.url === '/auth/refresh').length, 1)
    assert.equal(first.getSnapshot().status, 'authenticated')
    assert.equal(second.getSnapshot().status, 'authenticated')
    await first.logout()
    assert.equal(second.getSnapshot().status, 'anonymous')
})

test('refresh response loss blocks automatic rotation across tabs until explicit login', async () => {
    const backend = server()
    const environment = browserGroup()
    const first = createSession({ transport: backend.transport, environment })
    const second = createSession({ transport: backend.transport, environment })
    backend.refreshError = new Error('connection lost')
    await assert.rejects(first.restore())
    await second.restore()
    await first.restore({ manual: true })
    assert.equal(backend.calls.filter(call => call.url === '/auth/refresh').length, 1)
    assert.equal(first.getSnapshot().status, 'anonymous')
    await login(first)
    assert.equal(first.getSnapshot().status, 'authenticated')
})

test('CSRF 403 reacquires the token but never automatically repeats the mutation', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    backend.loginError = failure(403)
    await assert.rejects(login(session), error => error.code === 'CSRF' && errorMessage(error).includes('다시 시도'))
    assert.deepEqual(backend.calls.map(call => call.url), ['/auth/csrf', '/auth/login', '/auth/csrf'])
    backend.loginError = undefined
    await login(session)
    assert.equal(backend.calls.filter(call => call.url === '/auth/login').length, 2)
})

test('503 is an outage with manual recovery; logout failure is never reported as success', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    backend.refreshError = failure(503)
    await assert.rejects(session.restore())
    assert.equal(session.getSnapshot().status, 'error')
    assert.equal(session.getSnapshot().message, 'server 503')
    backend.refreshError = undefined
    await session.restore({ manual: true })
    backend.logoutError = new Error('connection lost')
    await assert.rejects(session.logout())
    assert.equal(session.getSnapshot().status, 'error')
    backend.logoutError = undefined
    await session.logout()
    assert.equal(session.getSnapshot().status, 'anonymous')
})

test('logout invalidates an in-flight refresh before it can revive the session', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    await login(session)
    const gate = deferred()
    backend.refreshGate = gate
    const restore = session.restore()
    await new Promise(done => setTimeout(done, 0))
    const logout = session.logout()
    gate.resolve()
    await assert.rejects(restore, error => error.code === 'STALE')
    await logout
    assert.equal(session.getSnapshot().status, 'anonymous')
})

test('late personalized responses cannot enter a new identity cache', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    await login(session)
    const oldGeneration = session.getSnapshot().generation
    const gate = deferred()
    backend.postGate = gate
    const request = session.request({ method: 'get', url: '/posts/1' }, { publicFallback: true })
    await session.login({ email: 'two@example.test', password: 'test-only' })
    gate.resolve()
    await assert.rejects(request, error => error.code === 'STALE')
    const queryClient = new QueryClient()
    queryClient.setQueryData(postKeys.detail(1, oldGeneration), { isAuthor: true })
    assert.equal(queryClient.getQueryData(postKeys.detail(1, session.getSnapshot().generation)), undefined)
    queryClient.clear()
})

test('draft restoration is same-account only and logout, changed or unknown identity discards it', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    await login(session)
    session.saveDraft('create', { title: 'private draft' }, '1')
    await login(session)
    assert.equal(session.readDraft('create', '1').title, 'private draft')
    await session.login({ email: 'two@example.test', password: 'test-only' })
    assert.equal(session.readDraft('create', '1'), null)
    session.saveDraft('edit:1', { content: 'private' }, '2')
    assert.equal(session.readDraft('edit:1', null), null)
    session.saveDraft('create', { content: 'private' }, '2')
    await session.logout()
    assert.equal(session.readDraft('create', '2'), null)
    assert.equal(tokenSubject('not-a-jwt'), null)
})

test('public detail falls back anonymously after rejected refresh, protected mutation does not', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: browserGroup() })
    await login(session)
    backend.expired = true
    backend.refreshError = failure(401)
    const response = await session.request({ method: 'get', url: '/posts/1' }, { publicFallback: true })
    assert.equal(response.data.isAuthor, false)
    assert.equal(backend.calls.at(-1).headers.Authorization, undefined)
    await assert.rejects(session.request({ method: 'post', url: '/posts' }), /로그인/)
})

test('missing coordination support stops automatic refresh without sending credentials', async () => {
    const backend = server()
    const session = createSession({ transport: backend.transport, environment: () => ({ navigator: {} }) })
    await assert.rejects(session.restore(), error => error.code === 'COORDINATION')
    assert.equal(backend.calls.length, 0)
    assert.equal(session.getSnapshot().status, 'anonymous')
})

test('API functions parse the official flat detail, page content and category array', async () => {
    const { default: api } = await import('../src/api/api.js')
    const { getPost, getPosts } = await import('../src/api/postApi.ts')
    const { getCategories } = await import('../src/api/postCategoryApi.ts')
    const originalAdapter = api.defaults.adapter
    api.defaults.adapter = async config => ({
        status: 200, statusText: 'OK', headers: {}, config,
        data: config.url === '/posts' ? { content: [{ postId: 7 }], totalElements: 1 } :
            config.url === '/categories' ? [{ id: 3, name: 'Spring' }] : { postId: 7, isAuthor: false }
    })
    try {
        assert.deepEqual(await getPosts(), [{ postId: 7 }])
        assert.deepEqual(await getCategories(), [{ id: 3, name: 'Spring' }])
        assert.deepEqual(await getPost(7), { postId: 7, isAuthor: false })
    } finally { api.defaults.adapter = originalAdapter }
})

test('a refresh in another tab cannot cancel a queued explicit logout', async () => {
    const backend = server()
    const environment = browserGroup()
    const first = createSession({ transport: backend.transport, environment })
    const second = createSession({ transport: backend.transport, environment })
    await second.restore()
    const gate = deferred()
    backend.refreshGate = gate
    const refresh = first.restore()
    await new Promise(done => setTimeout(done, 0))
    const logout = second.logout()
    gate.resolve()
    await refresh
    await logout
    assert.equal(first.getSnapshot().status, 'anonymous')
    assert.equal(second.getSnapshot().status, 'anonymous')
    assert.equal(backend.calls.filter(call => call.url === '/auth/logout').length, 1)
})

test('a delayed 401 from the old token reuses the already completed refresh', async () => {
    const environment = browserGroup()
    const late401 = deferred()
    const oldToken = jwt('1')
    const newToken = oldToken.replace('signature', 'new-signature')
    let refreshes = 0
    const attempts = []
    const transport = async config => {
        if (config.url === '/auth/csrf') return { data: { token: 'csrf' } }
        if (config.url === '/auth/login') return { data: { accessToken: oldToken, tokenType: 'Bearer' } }
        if (config.url === '/auth/refresh') {
            refreshes += 1
            return { data: { accessToken: newToken, tokenType: 'Bearer' } }
        }
        attempts.push({ url: config.url, token: config.headers.Authorization })
        if (config.headers.Authorization === `Bearer ${oldToken}`) {
            if (config.url === '/posts/late') await late401.promise
            throw failure(401)
        }
        return { data: { isAuthor: true } }
    }
    const session = createSession({ transport, environment })
    await login(session)
    const lateRequest = session.request({ method: 'get', url: '/posts/late' })
    await session.request({ method: 'get', url: '/posts/fast' })
    late401.resolve()
    await lateRequest
    assert.equal(refreshes, 1)
    assert.deepEqual(attempts.filter(call => call.url === '/posts/late').map(call => call.token), [
        `Bearer ${oldToken}`, `Bearer ${newToken}`
    ])
})

for (const followUpError of [failure(503), new Error('Network Error')]) {
    test(`logout 204 remains successful when follow-up CSRF fails (${followUpError.response?.status || 'network'})`, async () => {
        const backend = server()
        let failFollowUp = false
        const transport = async config => {
            if (config.url === '/auth/csrf' && failFollowUp) {
                failFollowUp = false
                throw followUpError
            }
            const response = await backend.transport(config)
            if (config.url === '/auth/logout') failFollowUp = true
            return response
        }
        const environment = browserGroup()
        const first = createSession({ transport, environment })
        const second = createSession({ transport, environment })
        await login(first)
        await second.restore()
        first.saveDraft('create', { title: 'first draft' }, '1')
        second.saveDraft('create', { title: 'second draft' }, '1')
        await first.logout()
        assert.equal(first.getSnapshot().status, 'anonymous')
        assert.equal(second.getSnapshot().status, 'anonymous')
        assert.equal(first.getSnapshot().accessToken, null)
        assert.equal(second.getSnapshot().accessToken, null)
        assert.match(first.getSnapshot().message, /로그아웃은 완료.*보안 토큰 갱신에 실패/)
        assert.equal(first.readDraft('create', '1'), null)
        assert.equal(second.readDraft('create', '1'), null)
        await login(first)
        assert.equal(first.getSnapshot().status, 'authenticated')
    })
}

for (const kind of ['login', 'refresh']) {
    test(`${kind} 200 retains the confirmed token after follow-up CSRF failure`, async () => {
        const backend = server()
        let failFollowUp = false
        const transport = async config => {
            if (config.url === '/auth/csrf' && failFollowUp) {
                failFollowUp = false
                throw failure(503)
            }
            const response = await backend.transport(config)
            if (config.url === `/auth/${kind}`) failFollowUp = true
            return response
        }
        const session = createSession({ transport, environment: browserGroup() })
        if (kind === 'login') await login(session)
        else await session.restore()
        assert.equal(session.getSnapshot().status, 'authenticated')
        assert.equal(session.getSnapshot().accessToken, jwt('1'))
        assert.match(session.getSnapshot().message, /완료.*보안 토큰 갱신에 실패/)
    })
}

test('server messages and intentional session errors are preserved; network errors use the UI fallback', () => {
    assert.equal(errorMessage(failure(503), '사용자 안내'), 'server 503')
    assert.equal(errorMessage(new Error('Network Error'), '연결할 수 없습니다.'), '연결할 수 없습니다.')
})

test('same-account remote login invalidates the detail generation when BroadcastChannel arrives before storage', async () => {
    const backend = server()
    const environment = browserGroup()
    const firstBrowser = environment()
    const secondBrowser = environment()
    const first = createSession({ transport: backend.transport, environment: () => firstBrowser })
    const second = createSession({ transport: backend.transport, environment: () => secondBrowser })
    await login(first)
    await second.restore()
    const before = second.getSnapshot().generation
    await login(first)
    const afterChannel = second.getSnapshot().generation
    assert.equal(second.getSnapshot().userId, '1')
    assert.ok(afterChannel > before)
    secondBrowser.dispatchStorage()
    assert.equal(second.getSnapshot().generation, afterChannel)
})

for (const refreshError of [failure(401), failure(503), new Error('refresh response lost')]) {
    test(`a late refresh failure cannot cancel the queued logout (${refreshError.response?.status || 'network'})`, async () => {
        const backend = server()
        const environment = browserGroup()
        const first = createSession({ transport: backend.transport, environment })
        const second = createSession({ transport: backend.transport, environment })
        await login(first)
        await second.restore()
        const gate = deferred()
        backend.refreshGate = gate
        backend.refreshError = refreshError
        const refresh = first.restore()
        await new Promise(done => setTimeout(done, 0))
        const logout = first.logout()
        gate.resolve()
        await assert.rejects(refresh, error => error.code === 'STALE')
        await logout
        assert.equal(backend.calls.filter(call => call.url === '/auth/logout').length, 1)
        assert.equal(first.getSnapshot().status, 'anonymous')
        assert.equal(second.getSnapshot().status, 'anonymous')
        assert.equal(first.getSnapshot().accessToken, null)
        assert.equal(second.getSnapshot().accessToken, null)
    })
}
