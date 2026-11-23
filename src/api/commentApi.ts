import { authSession } from '../auth/authSession.ts'
import type { CommentPage, CommentSort } from '../types/apiTypes'

export async function getComments(postId: string, page: number, sort: CommentSort, signal?: AbortSignal): Promise<CommentPage> {
    const response = await authSession.request<CommentPage>({
        method: 'get',
        url: `/posts/${postId}/comments`,
        params: { page, sort },
        signal
    }, { publicFallback: true })
    return response.data
}

export function createComment(postId: string, content: string) {
    return authSession.request({
        method: 'post',
        url: `/posts/${postId}/comments`,
        data: { content }
    })
}

export function updateComment(commentId: number, content: string) {
    return authSession.request({
        method: 'patch',
        url: `/comments/${commentId}`,
        data: { content }
    })
}

export function deleteComment(commentId: number) {
    return authSession.request({ method: 'delete', url: `/comments/${commentId}` })
}

export function setCommentLike(commentId: number, liked: boolean) {
    return authSession.request({
        method: liked ? 'post' : 'delete',
        url: `/comments/${commentId}/likes`
    })
}
