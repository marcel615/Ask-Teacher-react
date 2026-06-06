import {useParams, useNavigate} from 'react-router-dom'
import posts from './data/posts'
import './PostDetailPage.css'
import { getPostById } from './api/postApi'
import { useEffect, useState } from 'react'

function PostDetailPage() {
    const {postId} = useParams()
    const [post, setPost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const data = await getPostById(postId)

                console.log('게시글 상세 조회 성공:', data)

                setPost(data)
            } catch (error) {
                console.error('게시글 상세 조회 실패:', error.response?.data?.message)
                alert('게시글 상세 조회에 실패했습니다. 다시 시도해주세요.')
                
                setError(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPostDetail()
    }, [postId])    

    if (isLoading) {
        return <div className='post-detail-page'>로딩 중...</div>
    }

    if (error) {
        return <div className='post-detail-page'>오류가 발생했습니다.</div>
    }

    return (
        <div className='post-detail-page'>
            <h3 className='post-detail-title'>{post.title}</h3>
            <p className='post-detail-content'>{post.content}</p>
            <button className='post-detail-edit-button' onClick={() => navigate(`/posts/${post.id}/edit`)}>수정</button>
            {/* <button onClick={() => navigate(`/posts/${post.id}/delete`)}>삭제</button> */}
        </div>
    )
}


export default PostDetailPage