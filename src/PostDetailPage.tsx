import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { deletePost, getPost } from './api/postApi'
import { postKeys } from './api/queryKeys'
import { authSession } from './auth/authSession.js'
import { useAuth } from './auth/useAuth.js'
import { SessionStatus } from './auth/AuthBoundary.jsx'
import { errorMessage } from './auth/session.js'
import CommentSection from './component/CommentSection'
import PostAttachments from './component/PostAttachments'
import PostLikeButton from './component/PostLikeButton'
import './PostDetailPage.css'

const formatDateTime = (dateTime?: string) => dateTime ? dateTime.replace('T', ' ').slice(0, 16) : ''

function PostDetailPage() {
    const { postId = '' } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const auth = useAuth()
    const postQuery = useQuery({
        queryKey: postKeys.detail(postId, auth.generation),
        queryFn: ({ signal }) => getPost(postId, signal),
        enabled: Boolean(postId) && auth.status !== 'checking' && auth.status !== 'error',
        retry: false
    })
    const deleteMutation = useMutation({
        mutationFn: async () => {
            await deletePost(postId)
            return auth.generation
        },
        onSuccess: async generation => {
            if (!authSession.isCurrent(generation)) return
            queryClient.removeQueries({ queryKey: postKeys.details })
            await queryClient.invalidateQueries({ queryKey: postKeys.all })
            if (authSession.isCurrent(generation)) navigate('/posts', { replace: true })
        }
    })
    const handleDelete = () => {
        if (deleteMutation.isPending || postQuery.isFetching || postQuery.data?.isAuthor !== true) return
        if (window.confirm('게시글을 삭제하시겠습니까?')) deleteMutation.mutate()
    }
    if (auth.status === 'checking' || auth.status === 'error') return <SessionStatus />
    if (postQuery.isPending) return <p role="status">로딩 중...</p>
    if (postQuery.error) {
        return (
            <div className="post-detail-page" role="alert">
                <p>{errorMessage(postQuery.error, '게시글 상세 조회에 실패했습니다.')}</p>
                <button onClick={() => void postQuery.refetch()}>다시 시도</button>
            </div>
        )
    }
    const post = postQuery.data
    if (!post) return <p>게시글이 없습니다.</p>
    const canManage = auth.status === 'authenticated' && !postQuery.isFetching && post.isAuthor === true
    return (
        <div className="post-detail-page">
            <div className="post-detail-meta">
                <span>{post.categoryName}</span>
                <span>{formatDateTime(post.createdAt)}</span>
            </div>
            <h3 className="post-detail-title">{post.title}</h3>
            <p className="post-detail-content">{post.content}</p>
            <PostAttachments key={postId} files={post.files} />
            <PostLikeButton
                key={JSON.stringify(postKeys.detail(postId, auth.generation))}
                postId={postId}
                auth={auth}
                likeCount={post.likeCount}
                likedByMe={post.likedByMe === true}
                isFetching={postQuery.isFetching || deleteMutation.isPending}
            />
            {deleteMutation.error && (
                <p role="alert">{errorMessage(deleteMutation.error, '게시글 삭제에 실패했습니다.')}</p>
            )}
            {canManage && (
                <div className="post-detail-actions">
                    <button
                        className="post-detail-edit-button"
                        disabled={deleteMutation.isPending}
                        onClick={() => navigate(`/posts/${postId}/edit`)}
                    >
                        수정
                    </button>
                    <button
                        className="post-detail-delete-button"
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                    >
                        {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                    </button>
                </div>
            )}
            <CommentSection
                key={JSON.stringify(postKeys.detail(postId, auth.generation))}
                postId={postId}
                auth={auth}
            />
        </div>
    )
}

export default PostDetailPage
