import {useParams, useNavigate} from 'react-router-dom'
import posts from './data/posts'
import './PostDetailPage.css'

function PostDetailPage() {
    const {postId} = useParams()
    const post = posts[postId]
    const navigate = useNavigate()

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