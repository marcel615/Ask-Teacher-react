import api from './api.ts'
import type { Category } from '../types/apiTypes'

export const getCategories = async ({ signal }: { signal?: AbortSignal } = {}) => {
    const response = await api.get<Category[]>('/categories', { signal })
    return response.data
}
