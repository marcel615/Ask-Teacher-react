import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { authSession } from './authSession.js'
import type { PostFormValues } from '../types/postForm'

export function usePostDraft(key: string, owner: string | null, control: Control<PostFormValues>, enabled = true) {
    const values = useWatch({ control })
    useEffect(() => {
        if (enabled) authSession.saveDraft(key, values, owner)
    }, [key, owner, values, enabled])
    return values
}
