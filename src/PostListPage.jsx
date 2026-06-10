import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getPosts } from './api/postApi'
import { postKeys } from './api/queryKeys'
import './PostListPage.css'

const formatDateTime = dateTime => {
    if (!dateTime) {
        return ''
    }

    return dateTime.replace('T', ' ').slice(0, 16)
}

const PostListPage = () => {
    const navigate = useNavigate()
    const {
        data: postList = [],
        isLoading,
        error
    } = useQuery({
        queryKey: postKeys.all,
        queryFn: getPosts
    })

    if (isLoading) {
        return <div className="post-list-page">로딩 중...</div>
    }

    if (error) {
        const message = error.response?.data?.message || '게시글 목록을 불러오지 못했습니다.'

        return (
            <div className="post-list-page">
                <p className="error-message">게시글 목록을 불러오는 중 오류가 발생했습니다: {message}</p>
            </div>
        )
    }

    return (
        <div className="post-list-page">
            <div className="post-list-header">
                <h3 className="post-list-title">Post List</h3>
                <button className="post-list-create-button" onClick={() => navigate('/posts/create')}>
                    새 글 작성
                </button>
            </div>
            <div className="post-list">
                {postList.length === 0 && (
                    <p className="post-list-empty">게시글이 없습니다.</p>
                )}
                {postList.map(post => (
                    <div className="post-item" key={post.postId}>
                        <p className="post-item-created-at">{formatDateTime(post.createdAt)}</p>
                        <Link className="post-title-link" to={`/posts/${post.postId}`}>
                            {post.title}
                            {post.newPost && <span className="post-new-badge">new</span>}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PostListPage
