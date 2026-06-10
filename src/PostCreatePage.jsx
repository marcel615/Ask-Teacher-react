import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createPost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { categoryKeys, postKeys } from './api/queryKeys'
import PostForm from './component/PostForm'
import './PostCreatePage.css'

function PostCreatePage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm({
        defaultValues: {
            categoryId: '',
            title: '',
            content: ''
        }
    })

    const {
        data: categoryList = [],
        isLoading: isCategoryLoading,
        error: categoryError
    } = useQuery({
        queryKey: categoryKeys.all,
        queryFn: getCategories
    })

    const createMutation = useMutation({
        mutationFn: createPost,
        onSuccess: async response => {
            await queryClient.invalidateQueries({ queryKey: postKeys.all })
            alert(response.message || '게시글이 성공적으로 작성되었습니다.')
            navigate('/posts')
        }
    })
    const title = useWatch({ control, name: 'title' }) || ''
    const content = useWatch({ control, name: 'content' }) || ''

    const onSubmit = values => {
        createMutation.mutate({
            userId: 1,
            categoryId: Number(values.categoryId),
            title: values.title.trim(),
            content: values.content.trim()
        })
    }

    if (isCategoryLoading) {
        return <div className="post-create-page">로딩 중...</div>
    }

    if (categoryError) {
        const message = categoryError.response?.data?.message || '카테고리 목록을 불러오지 못했습니다.'
        return <div className="post-create-page">{message}</div>
    }

    const mutationError =
        createMutation.error?.response?.data?.message ||
        (createMutation.error ? '게시글 작성에 실패했습니다.' : '')

    return (
        <div className="post-create-page">
            <h3 className="post-create-title">Post Create Page</h3>
            {mutationError && (
                <p className="error-message">{mutationError}</p>
            )}
            <PostForm
                categoryList={categoryList}
                register={register}
                errors={errors}
                titleLength={title.length}
                contentLength={content.length}
                onSubmit={handleSubmit(onSubmit)}
                submitText={createMutation.isPending ? '작성 중...' : '작성'}
                disabled={createMutation.isPending}
            />
        </div>
    )
}

export default PostCreatePage
