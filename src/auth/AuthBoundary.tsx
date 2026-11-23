import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate, useLocation } from 'react-router-dom'
import { authSession } from './authSession.ts'
import { useAuth } from './useAuth.ts'
import { commentKeys, postKeys } from '../api/queryKeys.ts'

export function AuthLifecycle({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    useEffect(() => {
        let previous = authSession.getSnapshot().generation
        const unsubscribe = authSession.subscribe(() => {
            const generation = authSession.getSnapshot().generation
            if (generation !== previous) {
                previous = generation
                for (const queryKey of [postKeys.details, commentKeys.all]) {
                    void queryClient.cancelQueries({ queryKey })
                    queryClient.removeQueries({ queryKey })
                }
            }
        })
        void authSession.restore().catch(() => {})
        return unsubscribe
    }, [queryClient])
    return children
}

export function SessionStatus() {
    const auth = useAuth()
    const retry = useMutation({ mutationFn: () => authSession.restore({ manual: true }) })
    if (auth.status === 'checking') return <p role="status">로그인 상태를 확인하고 있습니다...</p>
    return <div role="alert">
        <p>{auth.message || '인증 서비스를 사용할 수 없습니다. 다시 시도해 주세요.'}</p>
        <button onClick={() => retry.mutate()} disabled={retry.isPending}>
            {retry.isPending ? '확인 중...' : '세션 다시 확인'}
        </button>
    </div>
}

export function RequireAuth({ children }: { children: ReactNode }) {
    const auth = useAuth()
    const location = useLocation()
    if (auth.status === 'checking' || auth.status === 'error') return <SessionStatus />
    if (auth.status !== 'authenticated') {
        return <Navigate to="/login" replace state={{ message: auth.message || '로그인이 필요한 화면입니다.', from: location.pathname }} />
    }
    return children
}
