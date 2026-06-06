import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from './component/PostForm'
import './PostCreatePage.css'
import { createPost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { validateForm } from './utils/postValidation'

function PostCreatePage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [categoryId, setCategoryId] = useState('')
    const [categoryList, setCategoryList] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories()

                setCategoryList(data)
            } catch (error) {
                console.error('카테고리 목록 조회 실패:', error.response?.data?.message)

                setError(error.response?.data?.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCategories()
    }, [])

    if (isLoading) {
        return <div className='post-create-page'>로딩 중...</div>
    }
    if (error) {
        return <div className='post-create-page'>오류가 발생했습니다. {error}</div>
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationMessage = validateForm(categoryId, title, content)
        if (validationMessage) {
            alert(validationMessage)
            return
        }

        const postData = {
            userId: 1,
            categoryId: Number(categoryId),
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
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                categoryList={categoryList}
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