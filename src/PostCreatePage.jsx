import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from './component/PostForm'
import './PostCreatePage.css'
import { createPost } from './api/postApi'

function PostCreatePage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const navigate = useNavigate()
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        const postData = {
            userId: 1,
            categoryId: 1,
            title,
            content
        }
        try {
            const data = await createPost(postData)

            console.log('게시글 작성 성공:', data)
            alert('게시글이 성공적으로 작성되었습니다.')

            navigate('/posts')
        } catch (error) {
            console.error('게시글 작성 실패:', error.response?.data?.message)
            alert('게시글 작성에 실패했습니다. 다시 시도해주세요.')
        }
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