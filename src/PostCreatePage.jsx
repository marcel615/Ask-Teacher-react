import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from './component/PostForm'
import './PostCreatePage.css'
import { createPost } from './api/postApi'
import { validateForm } from './utils/postValidation'

function PostCreatePage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationMessage = validateForm(title, content)
        if (validationMessage) {
            alert(validationMessage)
            return
        }

        const postData = {
            userId: 1,
            categoryId: 1,
            title: title.trim(),
            content: content.trim()
        }
        try {
            const data = await createPost(postData)

            console.log('게시글 작성 성공:', data)
            alert('게시글이 성공적으로 작성되었습니다.')

            navigate('/posts')
        } catch (error) {
            console.error('게시글 작성 실패:', error.response?.data?.message)

            setError(error.response?.data?.message)
        }
    }

    return (
        <div className="post-create-page">
            <h3 className="post-create-title">Post Create Page</h3>
            {error && (
                <p className="error-message">
                    게시글 작성 중 오류가 발생했습니다: {error}
                </p>
            )}
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