import { useState } from 'react'
import PostForm from './component/PostForm'

function PostEditPage( { post }) {
    const [title, setTitle] = useState(post.title)
    const [content, setContent] = useState(post.content)

    function handleSubmit(e) {
        e.preventDefault()
        console.log({ title, content })
    }
    return (
        <div>
            <h3>Post Edit Form</h3>
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