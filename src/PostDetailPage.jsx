import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { deletePost, getPostById } from './api/postApi'
import { postKeys } from './api/queryKeys'
import './PostDetailPage.css'

const formatDateTime = dateTime => {
    if (!dateTime) {
        return ''
    }

    return dateTime.replace('T', ' ').slice(0, 16)
}

function PostDetailPage() {
    const { postId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [deleteError, setDeleteError] = useState(null)

    const {
        data: post,
        isLoading,
        error
    } = useQuery({
        queryKey: postKeys.detail(postId),
        queryFn: () => getPostById(postId),
        enabled: Boolean(postId)
    })

    const deleteMutation = useMutation({
        mutationFn: () => deletePost(postId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: postKeys.all })
            navigate('/posts', { replace: true })
        },
        onError: error => {
            setDeleteError(error.response?.data?.message ?? '게시글 삭제에 실패했습니다.')
        }
    })

    const handleDelete = () => {
        if (deleteMutation.isPending) {
            return
        }

        const confirmed = window.confirm('게시글을 삭제하시겠습니까?')
        if (!confirmed) {
            return
        }

        setDeleteError(null)
        deleteMutation.mutate()
    }

    if (isLoading) {
        return <div className="post-detail-page">로딩 중...</div>
    }

    if (error) {
        const message = error.response?.data?.message ?? '게시글 상세 조회에 실패했습니다.'
        return <div className="post-detail-page">{message}</div>
    }

    return (
        <div className="post-detail-page">
            <div className="post-detail-meta">
                <span>{post.categoryName}</span>
                <span>{formatDateTime(post.createdAt)}</span>
            </div>
            <h3 className="post-detail-title">{post.title}</h3>
            <p className="post-detail-content">{post.content}</p>
            {deleteError && (
                <p className="post-detail-error">{deleteError}</p>
            )}
            <div className="post-detail-actions">
                <button
                    className="post-detail-edit-button"
                    disabled={deleteMutation.isPending}
                    onClick={() => navigate(`/posts/${post.postId ?? post.id ?? postId}/edit`)}
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
        </div>
    )
}

export default PostDetailPage
