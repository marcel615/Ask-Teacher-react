import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deletePost, getPostById } from './api/postApi'
import './PostDetailPage.css'

const formatDateTime = (dateTime) => {
    if (!dateTime) {
        return ''
    }

    return dateTime.replace('T', ' ').slice(0, 16)
}

function PostDetailPage() {
    const { postId } = useParams()
    const navigate = useNavigate()

    const [post, setPost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState(null)
    const [deleteError, setDeleteError] = useState(null)

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const data = await getPostById(postId)
                setPost(data)
            } catch (error) {
                setError(error.response?.data?.message ?? '게시글 상세 조회에 실패했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchPostDetail()
    }, [postId])

    const handleDelete = async () => {
        if (isDeleting) {
            return
        }

        const confirmed = window.confirm('게시글을 삭제하시겠습니까?')
        if (!confirmed) {
            return
        }

        try {
            setIsDeleting(true)
            setDeleteError(null)

            await deletePost(postId)

            navigate('/posts')
        } catch (error) {
            setDeleteError(error.response?.data?.message ?? '게시글 삭제에 실패했습니다.')
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return <div className='post-detail-page'>로딩 중...</div>
    }

    if (error) {
        return <div className='post-detail-page'>{error}</div>
    }

    return (
        <div className='post-detail-page'>
            <div className='post-detail-meta'>
                <span>{post.categoryName}</span>
                <span>{formatDateTime(post.createdAt)}</span>
            </div>
            <h3 className='post-detail-title'>{post.title}</h3>
            <p className='post-detail-content'>{post.content}</p>
            {deleteError && (
                <p className='post-detail-error'>{deleteError}</p>
            )}
            <div className='post-detail-actions'>
                <button
                    className='post-detail-edit-button'
                    disabled={isDeleting}
                    onClick={() => navigate(`/posts/${post.postId ?? post.id ?? postId}/edit`)}
                >
                    수정
                </button>
                <button
                    className='post-detail-delete-button'
                    disabled={isDeleting}
                    onClick={handleDelete}
                >
                    {isDeleting ? '삭제 중...' : '삭제'}
                </button>
            </div>
        </div>
    )
}

export default PostDetailPage
