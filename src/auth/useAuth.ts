import { useSyncExternalStore } from 'react'
import { authSession } from './authSession.ts'

export function useAuth() {
    return useSyncExternalStore(authSession.subscribe, authSession.getSnapshot)
}
