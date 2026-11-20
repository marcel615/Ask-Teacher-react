import { useState } from 'react'
import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { likePost, unlikePost } from '../api/postApi.js'
import { postKeys } from '../api/queryKeys.js'
import { authSession } from '../auth/authSession.js'
import { errorMessage } from '../auth/session.js'

function PostLikeButton({ postId, auth, likeCount, likedByMe, isFetching }) {
    const queryClient = useQueryClient()
    const [showLogin, setShowLogin] = useState(false)
    const detailFilter = { queryKey: postKeys.detail(postId, auth.generation), exact: true }
    const mutationFilter = { mutationKey: ['post-like', String(postId), auth.generation], exact: true }
    const isUpdating = useIsMutating(mutationFilter) > 0
    const likeMutation = useMutation({
        mutationKey: mutationFilter.mutationKey,
        networkMode: 'always',
        mutationFn: shouldLike => {
            if (!authSession.isCurrent(auth.generation)) {
                throw new Error('인증 상태가 변경되었습니다.')
            }
            return shouldLike ? likePost(postId) : unlikePost(postId)
        },
        onSettled: async () => {
            const listFilter = { queryKey: postKeys.all, exact: true }
            const currentDetailFilter = () => ({
                queryKey: postKeys.detail(postId, authSession.getSnapshot().generation),
                exact: true
            })
            await Promise.all([
                queryClient.cancelQueries(listFilter),
                queryClient.cancelQueries(currentDetailFilter())
            ])
            await Promise.all([
                queryClient.invalidateQueries(listFilter),
                queryClient.invalidateQueries(currentDetailFilter())
            ])
        }
    })

    const handleClick = () => {
        if (!authSession.isCurrent(auth.generation)) return
        if (auth.status === 'anonymous') {
            setShowLogin(true)
            return
        }

        const detail = queryClient.getQueryState(detailFilter.queryKey)
        if (
            isFetching ||
            queryClient.isMutating(mutationFilter) ||
            !detail?.data ||
            detail.status !== 'success' ||
            detail.fetchStatus !== 'idle'
        ) return

        likeMutation.mutate(detail.data.likedByMe !== true)
    }

    return (
        <div>
            <div className="post-detail-likes">
                <button
                    type="button"
                    className="post-detail-like-button"
                    aria-label="게시글 좋아요"
                    aria-pressed={likedByMe}
                    disabled={isFetching || isUpdating}
                    onClick={handleClick}
                >
                    <span aria-hidden="true">{likedByMe ? '♥' : '♡'}</span>
                </button>
                <span>좋아요 {likeCount}</span>
                {isUpdating && <span role="status">좋아요 처리 중...</span>}
            </div>
            {showLogin && (
                <>
                    <p role="status">좋아요를 누르려면 로그인해 주세요.</p>
                    <Link to="/login">로그인 화면으로 이동</Link>
                </>
            )}
            {likeMutation.error && (
                <div role="alert" className="post-detail-error">
                    <p>{errorMessage(likeMutation.error, '좋아요 요청에 실패했습니다.')}</p>
                    {likedByMe === likeMutation.variables ? (
                        <p>다시 조회한 좋아요 상태에 요청이 반영되어 있습니다.</p>
                    ) : (
                        <button type="button" onClick={handleClick} disabled={isFetching || isUpdating}>
                            좋아요 요청 다시 시도
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default PostLikeButton
