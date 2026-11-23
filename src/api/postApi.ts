import api from './api.js'
import { authSession } from '../auth/authSession.js'

import type {
    PostCreateRequest,
    PostCreateResult,
    PostDetail,
    PostListParams,
    PostPage,
    PostUpdateRequest,
    PostUpdateResult,
} from '../types/apiTypes'

export const getPostPage = async (params?: PostListParams, signal?: AbortSignal) => {
    const response = await api.get<PostPage>('/posts', { params, signal })
    return response.data
}

export const getPosts = async () => {
    return (await getPostPage()).content
}

export const getPost = async (postId: string, signal?: AbortSignal): Promise<PostDetail> => {
    const response = await authSession.request({ method: 'get', url: `/posts/${postId}`, signal }, { publicFallback: true })
    return response.data
}

export const postFormData = (postData: PostCreateRequest) => {
    const form = new FormData()
    form.append('categoryId', String(postData.categoryId))
    form.append('title', postData.title)
    form.append('content', postData.content)
    for (const file of postData.files ?? []) form.append('files', file)
    return form
}

export const resolvePostFileUrl = (fileUrl: string | undefined) => {
    if (typeof fileUrl !== 'string' || !fileUrl.trim()) return null
    const { origin, protocol } = new URL(api.defaults.baseURL ?? '')
    try {
        const url = new URL(fileUrl, origin)
        return url.origin === origin && url.protocol === protocol ? url.href : null
    } catch {
        return null
    }
}

export const createPost = async (postData: PostCreateRequest): Promise<PostCreateResult> => {
    const response = await authSession.request({ method: 'post', url: '/posts', data: postFormData(postData) })
    return response.data
}

export const updatePost = async (postId: string | number, postData: PostUpdateRequest): Promise<PostUpdateResult> => {
    const response = await authSession.request({ method: 'patch', url: `/posts/${postId}`, data: postFormData(postData) })
    return response.data
}

export const deletePost = async (postId: string | number) => {
    const response = await authSession.request({ method: 'delete', url: `/posts/${postId}` })
    return response.data
}

export const likePost = async (postId: string | number) => {
    await authSession.request({ method: 'post', url: `/posts/${postId}/likes` })
}

export const unlikePost = async (postId: string | number) => {
    await authSession.request({ method: 'delete', url: `/posts/${postId}/likes` })
}
