import { useId, useState } from 'react'
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createComment, deleteComment, getComments, setCommentLike, updateComment } from '../api/commentApi.js'
import { commentKeys } from '../api/queryKeys.js'
import { authSession } from '../auth/authSession.js'
import { errorMessage, SessionError } from '../auth/session.js'
import CommentForm from './CommentForm.jsx'
import CommentItem from './CommentItem.jsx'
import './CommentSection.css'

const failureMessages = {
    create: '댓글 작성에 실패했습니다.',
    edit: '댓글 수정에 실패했습니다.',
    delete: '댓글 삭제에 실패했습니다.',
    like: '댓글 좋아요 요청에 실패했습니다.'
}

function isWriter(auth, writerId) {
    return auth.status === 'authenticated' &&
        typeof auth.userId === 'string' && /^[1-9]\d*$/.test(auth.userId) &&
        Number.isSafeInteger(writerId) && auth.userId === String(writerId)
}

function CommentSection({ postId, auth }) {
    const headingId = useId()
    const queryClient = useQueryClient()
    const [sort, setSort] = useState('latest')
    const [page, setPage] = useState(0)
    const [editingId, setEditingId] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [message, setMessage] = useState('')
    const listKey = commentKeys.list(postId, auth.generation, sort, page)
    const mutationKey = ['comment-change', String(postId), auth.generation]
    const mutationFilter = { mutationKey, exact: true }
    const pending = useIsMutating(mutationFilter) > 0
    const list = useQuery({
        queryKey: listKey,
        queryFn: ({ signal }) => getComments(postId, page, sort, signal),
        networkMode: 'always',
        retry: false
    })

    const refreshPage = async () => {
        const result = await list.refetch()
        if (!authSession.isCurrent(auth.generation) || !result.isSuccess) return
        const lastPage = Math.max(0, result.data.totalPages - 1)
        if (page > lastPage) setPage(lastPage)
    }

    const mutation = useMutation({
        mutationKey,
        networkMode: 'always',
        mutationFn: action => {
            if (!authSession.isCurrent(auth.generation)) {
                throw new SessionError('인증 상태가 변경되었습니다.', 'STALE')
            }
            switch (action.kind) {
                case 'create': return createComment(postId, action.content)
                case 'edit': return updateComment(action.id, action.content)
                case 'delete': return deleteComment(action.id)
                case 'like': return setCommentLike(action.id, action.liked)
            }
        },
        onSettled: async (_response, error, action) => {
            if (error && action.kind !== 'like') return
            if (!authSession.isCurrent(auth.generation)) return

            const sessionLists = { queryKey: commentKeys.session(postId, auth.generation) }
            await queryClient.cancelQueries(sessionLists)
            await queryClient.invalidateQueries({ ...sessionLists, refetchType: 'none' })
            if (!authSession.isCurrent(auth.generation)) return
            await refreshPage()
        }
    })

    const change = async action => {
        if (!authSession.isCurrent(auth.generation) || queryClient.isMutating(mutationFilter)) return false
        if (auth.status === 'anonymous') {
            setShowLogin(true)
            return false
        }
        if (auth.status !== 'authenticated') return false
        setMessage('')
        try {
            await mutation.mutateAsync(action)
        } catch {
            return false
        }
        if (!authSession.isCurrent(auth.generation)) return false
        if (action.kind === 'create') setMessage('댓글을 작성했습니다.')
        if (action.kind === 'edit') setEditingId(null)
        return true
    }

    const currentComment = id => {
        const state = queryClient.getQueryState(listKey)
        if (state?.status !== 'success' || state.fetchStatus !== 'idle' || state.isInvalidated) return
        return state.data.comments.find(comment => comment.commentId === id)
    }

    const handleLike = (id, intended) => {
        if (auth.status === 'anonymous') {
            if (authSession.isCurrent(auth.generation)) setShowLogin(true)
            return
        }
        const comment = currentComment(id)
        if (!comment || comment.likedByMe === intended) return
        void change({ kind: 'like', id, liked: intended ?? !comment.likedByMe })
    }

    const saveEdit = (id, content) => {
        const comment = currentComment(id)
        return comment && isWriter(auth, comment.writerId)
            ? change({ kind: 'edit', id, content })
            : false
    }

    const cancelEdit = () => {
        setEditingId(null)
        mutation.reset()
    }

    const handleDelete = id => {
        const comment = currentComment(id)
        if (!comment || !isWriter(auth, comment.writerId) || queryClient.isMutating(mutationFilter)) return
        if (window.confirm('댓글을 삭제하시겠습니까?')) void change({ kind: 'delete', id })
    }

    const navigatePage = nextPage => {
        if (queryClient.isMutating(mutationFilter)) return
        setEditingId(null)
        mutation.reset()
        setPage(nextPage)
    }

    const failedAction = mutation.error ? mutation.variables : null
    const failedLike = failedAction?.kind === 'like' ? currentComment(failedAction.id) : null
    const busy = pending || list.isFetching

    return (
        <section className="comment-section" aria-labelledby={headingId}>
            <div className="comment-toolbar">
                <h4 id={headingId}>댓글</h4>
                <label>
                    정렬
                    <select value={sort} disabled={pending} onChange={event => {
                        if (queryClient.isMutating(mutationFilter)) return
                        navigatePage(0)
                        setSort(event.target.value)
                    }}>
                        <option value="latest">최신순</option>
                        <option value="likeCount">좋아요순</option>
                    </select>
                </label>
            </div>
            {auth.status === 'authenticated' ? (
                <CommentForm
                    disabled={pending}
                    onSubmit={content => change({ kind: 'create', content })}
                />
            ) : (
                <button type="button" onClick={() => setShowLogin(true)}>댓글 작성</button>
            )}
            {showLogin && (
                <div className="comment-login">
                    <p role="status">댓글을 작성하거나 좋아요를 누르려면 로그인해 주세요.</p>
                    <Link to="/login">로그인 화면으로 이동</Link>
                </div>
            )}
            {message && <p role="status">{message}</p>}
            {pending && <p role="status">댓글 변경 처리 중...</p>}
            {failedAction && (
                <div role="alert" className="comment-error">
                    <p>{errorMessage(mutation.error, failureMessages[failedAction.kind])}</p>
                    {failedLike && (failedLike.likedByMe === failedAction.liked ? (
                        <p>다시 조회한 좋아요 상태에 요청이 반영되어 있습니다.</p>
                    ) : (
                        <button type="button" disabled={busy}
                            onClick={() => handleLike(failedAction.id, failedAction.liked)}>
                            좋아요 요청 다시 시도
                        </button>
                    ))}
                </div>
            )}
            {list.isPending && <p role="status">댓글을 불러오는 중...</p>}
            {list.isError && (
                <div role="alert" className="comment-error">
                    <p>{errorMessage(list.error, '댓글 조회에 실패했습니다.')}</p>
                    <button type="button" disabled={busy} onClick={() => void refreshPage()}>댓글 다시 조회</button>
                </div>
            )}
            {list.data && (
                <>
                    {list.data.comments.length === 0 && !list.isError && <p>등록된 댓글이 없습니다.</p>}
                    <ul className="comment-list">
                        {list.data.comments.map(comment => {
                            const id = comment.commentId
                            return (
                                <CommentItem
                                    key={id}
                                    comment={comment}
                                    liked={auth.status === 'authenticated' && comment.likedByMe === true}
                                    canManage={isWriter(auth, comment.writerId)}
                                    editing={editingId === id}
                                    anotherEditOpen={editingId !== null}
                                    disabled={busy || list.isError}
                                    onLike={() => handleLike(id)}
                                    onEdit={() => setEditingId(id)}
                                    onSave={content => saveEdit(id, content)}
                                    onCancel={cancelEdit}
                                    onDelete={() => handleDelete(id)}
                                />
                            )
                        })}
                    </ul>
                </>
            )}
            {(page > 0 || list.data?.hasNext) && (
                <nav className="comment-pagination" aria-label="댓글 페이지">
                    <button type="button" disabled={pending || page === 0}
                        onClick={() => navigatePage(page - 1)}>이전</button>
                    <span aria-live="polite">{page + 1}페이지</span>
                    <button type="button" disabled={pending || !list.data?.hasNext || list.isError}
                        onClick={() => navigatePage(page + 1)}>다음</button>
                </nav>
            )}
        </section>
    )
}

export default CommentSection
