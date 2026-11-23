import api from './api.js'

export const getCategories = async ({ signal } = {}) => {
    const response = await api.get('/categories', { signal })
    return response.data
}

