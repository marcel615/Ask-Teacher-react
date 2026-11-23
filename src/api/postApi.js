import api from './api.js'
import { authSession } from '../auth/authSession.js'

/**
 * @typedef {import('../types/apiTypes').PostCreateRequest} PostCreateRequest
 * @typedef {import('../types/apiTypes').PostUpdateRequest} PostUpdateRequest
 */

/**
 * @param {{keyword?: string, categoryId?: string, page?: number}} [params]
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('../types/apiTypes').PostPage>}
 */
export const getPostPage = async (params, signal) => {
    const response = await api.get('/posts', { params, signal })
    return response.data
}

export const getPosts = async () => {
    return (await getPostPage()).content
}

export const getPost = async (postId, signal) => {
    const response = await authSession.request({ method: 'get', url: `/posts/${postId}`, signal }, { publicFallback: true })
    return response.data
}

export const postFormData = postData => {
    const form = new FormData()
    for (const key of ['categoryId', 'title', 'content']) form.append(key, postData[key])
    for (const file of postData.files ?? []) form.append('files', file)
    return form
}

export const resolvePostFileUrl = fileUrl => {
    if (typeof fileUrl !== 'string' || !fileUrl.trim()) return null
    const { origin, protocol } = new URL(api.defaults.baseURL)
    try {
        const url = new URL(fileUrl, origin)
        return url.origin === origin && url.protocol === protocol ? url.href : null
    } catch {
        return null
    }
}

/**
 * @param {PostCreateRequest} postData
 */
export const createPost = async (postData) => {
    const response = await authSession.request({ method: 'post', url: '/posts', data: postFormData(postData) })
    return response.data
}

/**
 * @param {string | number} postId
 * @param {PostUpdateRequest} postData
 */
export const updatePost = async (postId, postData) => {
    const response = await authSession.request({ method: 'patch', url: `/posts/${postId}`, data: postFormData(postData) })
    return response.data
}

export const deletePost = async (postId) => {
    const response = await authSession.request({ method: 'delete', url: `/posts/${postId}` })
    return response.data
}

export const likePost = async postId => {
    await authSession.request({ method: 'post', url: `/posts/${postId}/likes` })
}

export const unlikePost = async postId => {
    await authSession.request({ method: 'delete', url: `/posts/${postId}/likes` })
}

