import {useParams, useNavigate} from 'react-router-dom'
import posts from './data/posts'

function PostDetailPage() {
    const postId = useParams()
    const post = posts[postId.id]
    const navigate = useNavigate()

    return (
        <div>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <button onClick={() => navigate(`/posts/${post.id}/edit`)}>수정</button>
            {/* <button onClick={() => navigate(`/posts/${post.id}/delete`)}>삭제</button> */}
        </div>
    )
}


export default PostDetailPage