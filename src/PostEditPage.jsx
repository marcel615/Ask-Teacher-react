import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, updatePost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { categoryKeys, postKeys } from './api/queryKeys'
import PostForm from './component/PostForm'
import { authSession } from './auth/authSession.js'
import { useAuth } from './auth/useAuth.js'
import { usePostDraft } from './auth/usePostDraft.js'
import { errorMessage } from './auth/session.js'
import './PostEditpage.css'

function EditForm({ postId, post, categories, auth }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const draftKey = `edit:${postId}`
    const selectedCategory = categories.find(category => category.name === post.categoryName)
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm({
        defaultValues: authSession.readDraft(draftKey, auth.userId) || {
            categoryId: String(post.categoryId ?? selectedCategory?.id ?? ''),
            title: post.title ?? '',
            content: post.content ?? ''
        }
    })
    const { title = '', content = '' } = usePostDraft(draftKey, auth.userId, control)
    const updateMutation = useMutation({
        mutationFn: async values => ({
            response: await updatePost(postId, values),
            generation: auth.generation
        }),
        onSuccess: async ({ generation }) => {
            if (!authSession.isCurrent(generation)) return
            authSession.clearDraft(draftKey)
            await queryClient.invalidateQueries({ queryKey: postKeys.all })
            if (authSession.isCurrent(generation)) navigate(`/posts/${postId}`)
        }
    })
    const onSubmit = values => {
        if (updateMutation.isPending) return
        updateMutation.mutate({
            categoryId: Number(values.categoryId),
            title: values.title.trim(),
            content: values.content.trim()
        })
    }
    return (
        <div className="post-edit-page">
            <h3 className="post-edit-page-title">Post Edit Form</h3>
            {updateMutation.error && (
                <p role="alert">{errorMessage(updateMutation.error, '게시글 수정에 실패했습니다.')}</p>
            )}
            <PostForm
                categoryList={categories}
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

function PostEditPage() {
    const { postId } = useParams()
    const auth = useAuth()
    const postQuery = useQuery({
        queryKey: postKeys.detail(postId, auth.generation),
        queryFn: ({ signal }) => getPost(postId, signal),
        enabled: Boolean(postId),
        retry: false
    })
    const categoryQuery = useQuery({
        queryKey: categoryKeys.all,
        queryFn: getCategories
    })
    if (postQuery.isPending || categoryQuery.isPending) return <p role="status">로딩 중...</p>
    const queryError = postQuery.error || categoryQuery.error
    if (queryError) {
        const retryQueries = () => {
            void postQuery.refetch()
            void categoryQuery.refetch()
        }
        return (
            <div role="alert">
                <p>{errorMessage(queryError, '게시글 수정 정보를 불러오지 못했습니다.')}</p>
                <button onClick={retryQueries}>다시 시도</button>
            </div>
        )
    }
    if (postQuery.isFetching) return <p role="status">작성자 권한을 확인하고 있습니다...</p>
    if (postQuery.data?.isAuthor !== true) return <p role="alert">작성자만 게시글을 수정할 수 있습니다.</p>
    return (
        <EditForm
            key={`${postId}:${auth.generation}`}
            postId={postId}
            post={postQuery.data}
            categories={categoryQuery.data}
            auth={auth}
        />
    )
}

export default PostEditPage
