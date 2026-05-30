import { useState } from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import PostForm from './component/PostForm'
import posts from './data/posts'
import './PostEditPage.css'

function PostEditPage() {
    const { postId } = useParams()
    const post = posts.find(post => post.id === Number(postId))
    const navigate = useNavigate()

    const [title, setTitle] = useState(post.title)
    const [content, setContent] = useState(post.content)

    function handleSubmit(e) {
        e.preventDefault()
        console.log({ title, content })

        navigate(`/posts/${postId}`)
    }

    return (
        <div className="post-edit-page">
            <h3 className="post-edit-page-title">Post Edit Form</h3>
            <PostForm
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                onSubmit={handleSubmit}
                submitText="수정"
            />
        </div>
    )
}

export default PostEditPage