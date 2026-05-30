import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from './component/PostForm'
import './PostCreatePage.css'

function PostCreatePage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const navigate = useNavigate()
    
    const handleSubmit = (e) => {
        e.preventDefault()

        console.log({ title, content })
        setTitle('')
        setContent('')

        navigate('/posts')

    }
    return (
        <div className="post-create-page">
            <h3 className="post-create-title">Post Create Page</h3>
            <PostForm 
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                onSubmit={handleSubmit}
                submitText="작성"
            />
        </div>
    )
}

export default PostCreatePage