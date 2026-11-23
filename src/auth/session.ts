import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { LoginRequest, LoginResponse } from '../types/apiTypes'
import type { PostFormValues } from '../types/postForm'
import type { AuthSnapshot } from './types'

type Transport = <Data>(config: AxiosRequestConfig) => Promise<AxiosResponse<Data>>
type CoordinationStatus = 'unknown' | 'login' | 'authenticated' | 'anonymous' | 'blocked'
type CookieAction = 'login' | 'refresh' | 'logout'

interface CoordinationRecord {
    version: number
    status: CoordinationStatus
}

interface CoordinationMessage extends CoordinationRecord {
    accessToken?: string | null
    tokenType?: string
}

interface SessionFailure extends Error {
    code?: string
    response?: { status?: number; data?: { message?: string } }
}

const COORDINATION_KEY = 'askteacher.auth.coordination.v1'
const LOCK_NAME = 'askteacher.auth.cookies.v1'
const CHANNEL_NAME = 'askteacher.auth.v1'

export const errorMessage = (cause: unknown, fallback: string) => {
    const error = cause as SessionFailure | null
    if (error instanceof SessionError || error?.code === 'CSRF') return error.message
    return error?.response?.data?.message || fallback
}

export class SessionError extends Error {
    code: string

    constructor(message: string, code = 'SESSION_REQUIRED') {
        super(message)
        this.code = code
    }
}

// This unverified claim only separates in-memory drafts. The server decides authorization.
export function tokenSubject(token: string) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const subject = JSON.parse(atob(payload)).sub
        return typeof subject === 'string' && subject.trim() ? subject : null
    } catch {
        return null
    }
}

export function createSession({ transport, environment = () => window }: {
    transport: Transport
    environment?: () => Window & typeof globalThis
}) {
    let state: AuthSnapshot = { status: 'checking', accessToken: null, userId: null, generation: 0, message: '' }
    let revision = 0
    let restorePromise: Promise<AuthSnapshot | LoginResponse | null | undefined> | undefined
    let channel: BroadcastChannel
    let initialized = false
    let coordinationFailed = false
    let explicitMutationPending = false
    let seenVersion = 0
    const listeners = new Set<() => void>()
    const drafts = new Map<string, { owner: string; values: Partial<PostFormValues> }>()

    const emit = (patch: Partial<AuthSnapshot>) => {
        state = { ...state, ...patch }
        listeners.forEach(listener => listener())
    }
    const clearIdentity = (status: AuthSnapshot['status'], message = '', discardDrafts = false) => {
        revision += 1
        if (discardDrafts) drafts.clear()
        emit({ status, accessToken: null, userId: null, generation: state.generation + 1, message })
    }
    const readCoordination = (): CoordinationRecord => JSON.parse(environment().localStorage.getItem(COORDINATION_KEY) || '{"version":0,"status":"unknown"}')
    const publish = (status: CoordinationStatus) => {
        try {
            const previous = readCoordination()
            const record = { version: previous.version + 1, status }
            environment().localStorage.setItem(COORDINATION_KEY, JSON.stringify(record))
            seenVersion = record.version
            channel.postMessage({
                ...record,
                ...(['login', 'authenticated'].includes(status) && state.status === 'authenticated' ? {
                    accessToken: state.accessToken, tokenType: 'Bearer'
                } : {})
            })
            return record
        } catch {
            coordinationFailed = true
            clearIdentity('anonymous', '탭 간 인증 조정에 실패했습니다. 다시 로그인해 주세요.')
            throw new SessionError(state.message, 'COORDINATION')
        }
    }
    const onRemoteChange = (event?: MessageEvent<CoordinationMessage>) => {
        // The queued explicit action owns the next cookie change. A preceding
        // tab's refresh must not cancel a requested logout or account switch.
        if (explicitMutationPending) return
        try {
            const record = readCoordination()
            // Tokens travel only over the ephemeral same-origin channel, never storage.
            if (['login', 'authenticated'].includes(record.status) && event?.data?.version === record.version && event.data.accessToken && record.version >= seenVersion) {
                seenVersion = record.version
                revision += 1
                commitToken(event.data, revision, record.status === 'login')
                return
            }
            if (record.version <= seenVersion) return
            seenVersion = record.version
            if (record.status === 'anonymous') {
                clearIdentity('anonymous', '', true)
            } else if (record.status === 'blocked') {
                clearIdentity('anonymous', '세션 처리 결과를 확인할 수 없습니다. 다시 로그인해 주세요.')
            } else {
                clearIdentity('error', '다른 탭에서 인증 상태가 변경되었습니다. 세션을 다시 확인해 주세요.')
            }
        } catch {
            coordinationFailed = true
            clearIdentity('anonymous', '탭 간 인증 조정에 실패했습니다. 다시 로그인해 주세요.')
        }
    }
    const initialize = () => {
        if (coordinationFailed) throw new SessionError('탭 간 인증 조정을 복구할 수 없습니다. 새로고침 후 다시 로그인해 주세요.', 'COORDINATION')
        if (initialized) return
        const browser = environment()
        if (!browser.navigator?.locks || !browser.BroadcastChannel || !browser.localStorage) {
            throw new SessionError('탭 간 인증 조정을 사용할 수 없습니다. 지원되는 브라우저에서 다시 로그인해 주세요.', 'COORDINATION')
        }
        readCoordination()
        channel = new browser.BroadcastChannel(CHANNEL_NAME)
        channel.onmessage = onRemoteChange
        browser.addEventListener('storage', event => {
            if (event.key === COORDINATION_KEY) onRemoteChange()
        })
        initialized = true
    }
    const withCookieLock = async <Result>(operation: () => Promise<Result>) => {
        initialize()
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        try {
            return await environment().navigator.locks.request(LOCK_NAME, { signal: controller.signal }, async () => {
                clearTimeout(timeout)
                return operation()
            })
        } catch (error) {
            if (controller.signal.aborted) {
                throw new SessionError('다른 탭의 인증 처리가 지연되고 있습니다. 자동 복구를 중단했습니다. 다시 로그인해 주세요.', 'COORDINATION')
            }
            throw error
        } finally {
            clearTimeout(timeout)
        }
    }
    const getCsrf = async () => {
        const response = await transport<{ token?: string }>({ method: 'get', url: '/auth/csrf', withCredentials: true })
        if (!response.data?.token) throw new SessionError('보안 토큰을 받지 못했습니다. 다시 시도해 주세요.', 'CSRF')
        return response.data.token
    }
    const commitToken = (data: { accessToken?: string | null; tokenType?: string } | undefined, expectedRevision: number, forceNewGeneration = false) => {
        if (revision !== expectedRevision) throw new SessionError('인증 상태가 변경되었습니다. 다시 시도해 주세요.', 'STALE')
        if (!data?.accessToken || data.tokenType?.toLowerCase() !== 'bearer') {
            throw new SessionError('인증 응답을 확인할 수 없습니다. 다시 로그인해 주세요.', 'INVALID_TOKEN')
        }
        const userId = tokenSubject(data.accessToken)
        for (const [key, draft] of drafts) {
            if (!userId || draft.owner !== userId) drafts.delete(key)
        }
        const identityChanged = forceNewGeneration || state.userId !== userId || state.status !== 'authenticated'
        emit({ status: 'authenticated', accessToken: data.accessToken, userId,
            generation: state.generation + Number(identityChanged), message: '' })
    }
    const cookieRequest = async (kind: CookieAction, data: LoginRequest | undefined, expectedRevision: number) => {
        let mutationSent = false
        try {
            const csrf = await getCsrf()
            if (revision !== expectedRevision) throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
            mutationSent = true
            const response = await transport<LoginResponse | undefined>({
                method: 'post', url: `/auth/${kind}`, data, withCredentials: true,
                headers: { 'X-XSRF-TOKEN': csrf, ...(kind === 'logout' && state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {}) }
            })
            if (revision !== expectedRevision) {
                // Even a superseded successful mutation changed the cookie binding.
                await getCsrf().catch(() => {})
                throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
            }
            if (kind === 'logout') {
                clearIdentity('anonymous', '', true)
                publish('anonymous')
            } else {
                commitToken(response.data, expectedRevision)
                publish(kind === 'login' ? 'login' : 'authenticated')
            }
            const completedRevision = revision
            try {
                await getCsrf()
            } catch {
                // The mutation's confirmed success is independent of this follow-up.
                // Every next explicit auth action acquires a fresh CSRF token first.
                if (revision === completedRevision) {
                    const action = kind === 'logout' ? '로그아웃' : kind === 'login' ? '로그인' : '세션 복구'
                    emit({ message: `${action}은 완료됐지만 보안 토큰 갱신에 실패했습니다. 다음 인증 요청에서 다시 확인합니다.` })
                }
            }
            return response.data
        } catch (cause) {
            const error = cause as SessionFailure
            if (revision !== expectedRevision) {
                // A queued explicit logout/account switch owns the current state.
                // An uncertain rotation must still stop other tabs from refreshing,
                // without advancing the revision and cancelling that explicit action.
                if (kind === 'refresh' && mutationSent && !error.response && error.code !== 'STALE') {
                    publish('blocked')
                }
                throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
            }
            if (error.code === 'STALE' || error.code === 'COORDINATION') throw error
            const status = error.response?.status
            if (status === 403) {
                try {
                    await getCsrf()
                    error.message = `${errorMessage(error, '보안 검증에 실패했습니다.')} 보안 토큰을 갱신했습니다. 다시 시도해 주세요.`
                } catch {
                    error.message = '보안 토큰 갱신에 실패했습니다. 다시 시도해 주세요.'
                }
                error.code = 'CSRF'
            }
            if (kind === 'refresh' && mutationSent && !error.response) {
                publish('blocked')
                clearIdentity('anonymous', '재발급 결과를 확인할 수 없습니다. 다시 로그인해 주세요.')
            } else if (kind === 'refresh' && status === 401) {
                publish('blocked')
                clearIdentity('anonymous', '로그인이 만료되었습니다. 다시 로그인해 주세요.')
            } else if (kind === 'refresh' || kind === 'logout') {
                emit({ status: 'error', message: errorMessage(error, '인증 처리에 실패했습니다. 다시 시도해 주세요.') })
            }
            throw error
        }
    }

    const restore = ({ manual = false } = {}) => {
        if (restorePromise) return restorePromise
        const expectedRevision = revision
        restorePromise = withCookieLock(async () => {
            if (revision !== expectedRevision && state.status === 'authenticated') return state
            const coordination = readCoordination()
            if (coordination.status === 'blocked' || coordination.status === 'anonymous') {
                clearIdentity('anonymous', coordination.status === 'blocked' ? '자동 복구를 중단했습니다. 다시 로그인해 주세요.' : '')
                return null
            }
            if (state.status === 'error' && !manual) throw new SessionError(state.message, 'AUTH_UNAVAILABLE')
            return cookieRequest('refresh', undefined, expectedRevision)
        }).catch((error: SessionFailure) => {
            if (error.code === 'COORDINATION') clearIdentity('anonymous', error.message)
            throw error
        }).finally(() => { restorePromise = undefined })
        return restorePromise
    }

    const request = async <Data = unknown>(config: AxiosRequestConfig, { publicFallback = false } = {}): Promise<AxiosResponse<Data>> => {
        const generation = state.generation
        const token = state.accessToken
        const owner = state.userId
        if (!publicFallback && !token) throw new SessionError('로그인이 필요합니다. 다시 로그인해 주세요.')
        const send = (accessToken: string | null) => transport<Data>({ ...config, headers: {
            ...config.headers, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        } })
        try {
            const response = await send(token)
            if (generation !== state.generation) throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
            return response
        } catch (cause) {
            const error = cause as SessionFailure
            if (error.response?.status !== 401 || generation !== state.generation) throw error
            const alreadyRefreshed = state.status === 'authenticated' &&
                state.accessToken !== token && state.userId === owner
            if (!alreadyRefreshed) {
                try {
                    await restore()
                } catch (restoreError) {
                    if (!publicFallback || state.status !== 'anonymous') throw restoreError
                }
            }
            if (state.accessToken) {
                if (!publicFallback && (!owner || state.userId !== owner)) {
                    throw new SessionError('인증 계정이 변경되었습니다. 다시 확인해 주세요.', 'STALE')
                }
                const currentGeneration = state.generation
                try {
                    const response = await send(state.accessToken)
                    if (currentGeneration !== state.generation) throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
                    return response
                } catch (retryCause) {
                    const retryError = retryCause as SessionFailure
                    if (retryError.response?.status !== 401 || currentGeneration !== state.generation) throw retryError
                    clearIdentity('anonymous', '로그인이 만료되었습니다. 다시 로그인해 주세요.')
                    if (!publicFallback) throw new SessionError('로그인이 만료되었습니다. 다시 로그인해 주세요.')
                }
            }
            if (publicFallback && state.status === 'anonymous') {
                const currentGeneration = state.generation
                const response = await send(null)
                if (currentGeneration !== state.generation) throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
                return { ...response, data: { ...response.data, isAuthor: false } }
            }
            throw new SessionError('로그인이 필요합니다. 다시 로그인해 주세요.')
        }
    }

    return {
        getSnapshot: () => state,
        subscribe: (listener: () => void) => {
            listeners.add(listener)
            return () => { listeners.delete(listener) }
        },
        restore,
        login: (data: LoginRequest) => {
            explicitMutationPending = true
            clearIdentity('checking')
            const expectedRevision = revision
            return withCookieLock(() => cookieRequest('login', data, expectedRevision)).catch(error => {
                if (revision === expectedRevision) emit({ status: 'anonymous', message: errorMessage(error, '로그인에 실패했습니다.') })
                throw error
            }).finally(() => { explicitMutationPending = false })
        },
        logout: () => {
            explicitMutationPending = true
            // Invalidate pending refresh and UI work before waiting for its cookie lock.
            const previousToken = state.accessToken
            clearIdentity('checking', '', true)
            const expectedRevision = revision
            return withCookieLock(() => {
                emit({ accessToken: previousToken })
                return cookieRequest('logout', undefined, expectedRevision)
            }).catch(error => {
                if (revision === expectedRevision) emit({ status: 'error', accessToken: null, message: errorMessage(error, '로그아웃에 실패했습니다.') })
                throw error
            }).finally(() => { explicitMutationPending = false })
        },
        request,
        isCurrent: (generation: number) => state.generation === generation,
        saveDraft: (key: string, values: Partial<PostFormValues>, owner: string | null) => {
            if (owner) drafts.set(key, { owner, values: { ...values } })
        },
        readDraft: (key: string, owner: string | null) => {
            const draft = drafts.get(key)
            if (!owner || draft?.owner !== owner) { drafts.delete(key); return null }
            return draft?.values || null
        },
        clearDraft: (key: string) => drafts.delete(key)
    }
}
