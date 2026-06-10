import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getPostById, updatePost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { categoryKeys, postKeys } from './api/queryKeys'
import PostForm from './component/PostForm'
import './PostEditpage.css'

function PostEditPage() {
    const { postId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors }
    } = useForm({
        defaultValues: {
            categoryId: '',
            title: '',
            content: ''
        }
    })

    const postQuery = useQuery({
        queryKey: postKeys.detail(postId),
        queryFn: () => getPostById(postId),
        enabled: Boolean(postId)
    })

    const categoryQuery = useQuery({
        queryKey: categoryKeys.all,
        queryFn: getCategories
    })

    useEffect(() => {
        if (!postQuery.data || !categoryQuery.data) {
            return
        }

        const selectedCategory = categoryQuery.data.find(category => (
            category.id === postQuery.data.categoryId ||
            category.name === postQuery.data.categoryName ||
            category.id === postQuery.data.category?.id ||
            category.name === postQuery.data.category?.name
        ))

        reset({
            categoryId: String(postQuery.data.categoryId ?? selectedCategory?.id ?? ''),
            title: postQuery.data.title ?? '',
            content: postQuery.data.content ?? ''
        })
    }, [categoryQuery.data, postQuery.data, reset])

    const updateMutation = useMutation({
        mutationFn: postData => updatePost(postId, postData),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: postKeys.all }),
                queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
            ])
            navigate(`/posts/${postId}`)
        }
    })
    const title = useWatch({ control, name: 'title' }) || ''
    const content = useWatch({ control, name: 'content' }) || ''

    const onSubmit = values => {
        updateMutation.mutate({
            userId: 1,
            categoryId: Number(values.categoryId),
            title: values.title.trim(),
            content: values.content.trim()
        })
    }

    if (postQuery.isLoading || categoryQuery.isLoading) {
        return <div className="post-edit-page">로딩 중...</div>
    }

    const queryError = postQuery.error || categoryQuery.error
    if (queryError) {
        const message = queryError.response?.data?.message || '게시글 수정 정보를 불러오지 못했습니다.'
        return <div className="post-edit-page">{message}</div>
    }

    const mutationError =
        updateMutation.error?.response?.data?.message ||
        (updateMutation.error ? '게시글 수정에 실패했습니다.' : '')

    return (
        <div className="post-edit-page">
            <h3 className="post-edit-page-title">Post Edit Form</h3>
            {mutationError && (
                <p className="post-edit-page-error">{mutationError}</p>
            )}
            <PostForm
                categoryList={categoryQuery.data}
                register={register}
                errors={errors}
                titleLength={title.length}
                contentLength={content.length}
                onSubmit={handleSubmit(onSubmit)}
                submitText={updateMutation.isPending ? '수정 중...' : '수정'}
                disabled={updateMutation.isPending}
            />
        </div>
    )
}

export default PostEditPage
