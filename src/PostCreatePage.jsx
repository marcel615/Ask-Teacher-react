import { useState } from 'react'
import PostForm from './component/PostForm'

function PostCreatePage() {

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    
    const handleSubmit = (e) => {
        e.preventDefault()

        console.log({ title, content })
        setTitle('')
        setContent('')

    }
    return (
        <div>
            <h3>Post Create Page</h3>
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