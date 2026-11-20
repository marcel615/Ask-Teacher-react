import { authSession } from '../auth/authSession.js'

export async function getComments(postId, page, sort, signal) {
    const response = await authSession.request({
        method: 'get',
        url: `/posts/${postId}/comments`,
        params: { page, sort },
        signal
    }, { publicFallback: true })
    return response.data
}

export function createComment(postId, content) {
    return authSession.request({
        method: 'post',
        url: `/posts/${postId}/comments`,
        data: { content }
    })
}

export function updateComment(commentId, content) {
    return authSession.request({
        method: 'patch',
        url: `/comments/${commentId}`,
        data: { content }
    })
}

export function deleteComment(commentId) {
    return authSession.request({ method: 'delete', url: `/comments/${commentId}` })
}

export function setCommentLike(commentId, liked) {
    return authSession.request({
        method: liked ? 'post' : 'delete',
        url: `/comments/${commentId}/likes`
    })
}
