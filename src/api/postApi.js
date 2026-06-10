import api from './api'

/**
 * @typedef {import('../types/apiTypes').PostCreateRequest} PostCreateRequest
 * @typedef {import('../types/apiTypes').PostUpdateRequest} PostUpdateRequest
 */

export const getPosts = async () => {
    const response = await api.get('/posts')
    return response.data.data
}

export const getPostById = async (postId) => {
    const response = await api.get(`/posts/${postId}`)
    return response.data.data
}

/**
 * @param {PostCreateRequest} postData
 */
export const createPost = async (postData) => {
    const response = await api.post('/posts', postData)
    return response.data
}

/**
 * @param {string | number} postId
 * @param {PostUpdateRequest} postData
 */
export const updatePost = async (postId, postData) => {
    const response = await api.patch(`/posts/${postId}`, postData)
    return response.data
}

export const deletePost = async (postId) => {
    const response = await api.delete(`/posts/${postId}`)
    return response.data
}

