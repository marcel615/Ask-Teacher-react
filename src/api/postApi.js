import api from './api'

export const getPosts = async () => {
    const response = await api.get('/posts')
    return response.data.data
}

export const getPostById = async (postId) => {
    const response = await api.get(`/posts/${postId}`)
    return response.data.data
}

export const createPost = async (postData) => {
    const response = await api.post('/posts', postData)
    return response.data.data
}

export const updatePost = async (postId, postData) => {
    const response = await api.patch(`/posts/${postId}`, postData)
    return response.data.data
}

export const deletePost = async (postId) => {
    await api.delete(`/posts/${postId}`)
}

