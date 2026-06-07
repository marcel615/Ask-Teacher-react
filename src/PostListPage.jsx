import {useEffect, useState} from 'react'
import {Link, useNavigate } from 'react-router-dom'
import './PostListPage.css'
import {getPosts} from './api/postApi'

const PostListPage = () => {
    const [postList, setPostList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getPosts()
                
                setPostList(data)
            } catch (error) {
                console.error('게시글 목록 조회 실패:', error.response?.data?.message)

                setError(error.response?.data?.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPosts()
    }, [])

    if (isLoading) {
        return <div className='post-list-page'>로딩 중...</div>
    }

    if (error) {
        return (
            <div className='post-list-page'>
                <p className='error-message'>
                    게시글 목록을 불러오는 중 오류가 발생했습니다: {error}
                </p>
            </div>
        )
    }

    return (
        <div className='post-list-page'>
            <div className='post-list-header'>
                <h3 className='post-list-title'>Post List</h3>
                <button className='post-list-create-button' onClick={() => navigate('/posts/create')}>
                    새 글 작성
                </button>            
            </div>
            <div className='post-list'>
                {postList.map( post => (
                    <div className='post-item' key={post.postId}>
                        <Link className='post-title-link' to={`/posts/${post.postId}`}>
                            {post.title}
                            {post.newPost && <span className='post-new-badge'>new</span>}
                        </Link>
                        {/* <p className='post-content'>{post.content}</p> */}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PostListPage
