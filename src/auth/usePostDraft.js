import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { authSession } from './authSession.js'

export function usePostDraft(key, owner, control, enabled = true) {
    const values = useWatch({ control })
    useEffect(() => {
        if (enabled) authSession.saveDraft(key, values, owner)
    }, [key, owner, values, enabled])
    return values
}
