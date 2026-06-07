import { useEffect, useState } from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import PostForm from './component/PostForm'
import './PostEditpage.css'
import { getPostById, updatePost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { validateForm } from './utils/postValidation'

function PostEditPage() {
    const { postId } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categoryList, setCategoryList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchEditData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const [postData, categories] = await Promise.all([
                    getPostById(postId),
                    getCategories()
                ])

                const selectedCategory = categories.find(category => (
                    category.id === postData.categoryId ||
                    category.name === postData.categoryName ||
                    category.id === postData.category?.id ||
                    category.name === postData.category?.name
                ))

                setTitle(postData.title ?? '')
                setContent(postData.content ?? '')
                setCategoryId(String(postData.categoryId ?? selectedCategory?.id ?? ''))
                setCategoryList(categories)
            } catch (error) {
                setError(error.response?.data?.message ?? '게시글 수정 정보를 불러오지 못했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchEditData()
    }, [postId])

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
            setIsLoading(true)
            setError(null)

            await updatePost(postId, postData)

            navigate(`/posts/${postId}`)
        } catch (error) {
            setError(error.response?.data?.message ?? '게시글 수정에 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading && !title && !content) {
        return <div className="post-edit-page">로딩 중...</div>
    }

    return (
        <div className="post-edit-page">
            <h3 className="post-edit-page-title">Post Edit Form</h3>
            {error && (
                <p className="post-edit-page-error">{error}</p>
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
                submitText="수정"
                disabled={isLoading}
            />
        </div>
    )
}

export default PostEditPage
