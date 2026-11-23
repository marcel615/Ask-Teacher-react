import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, updatePost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { categoryKeys, postKeys } from './api/queryKeys'
import PostForm from './component/PostForm'
import { authSession } from './auth/authSession.js'
import { useAuth } from './auth/useAuth.js'
import { usePostDraft } from './auth/usePostDraft'
import { errorMessage, SessionError } from './auth/session.js'
import type { AuthSnapshot } from './auth/types'
import type { Category, PostDetail, PostUpdateRequest } from './types/apiTypes'
import type { PostFormValues } from './types/postForm'
import './PostEditpage.css'

interface EditFormProps {
    postId: string
    post: PostDetail
    categories: Category[]
    auth: AuthSnapshot
    checkingAuthor: boolean
    authorCheckFailed: boolean
}

function EditForm({ postId, post, categories, auth, checkingAuthor, authorCheckFailed }: EditFormProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const draftKey = `edit:${postId}`
    const selectedCategory = categories.find(category => category.name === post.categoryName)
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<PostFormValues>({
        defaultValues: authSession.readDraft(draftKey, auth.userId) || {
            categoryId: String(post.categoryId ?? selectedCategory?.id ?? ''),
            title: post.title ?? '',
            content: post.content ?? ''
        }
    })
    const { title = '', content = '' } = usePostDraft(draftKey, auth.userId, control)
    const updateMutation = useMutation({
        mutationFn: async (values: PostUpdateRequest) => {
            if (!authSession.isCurrent(auth.generation)) {
                throw new SessionError('로그인 상태가 변경되었습니다.')
            }
            return { response: await updatePost(postId, values), generation: auth.generation }
        },
        onSuccess: async ({ generation }) => {
            if (!authSession.isCurrent(generation)) return
            authSession.clearDraft(draftKey)
            await queryClient.invalidateQueries({ queryKey: postKeys.all })
            if (authSession.isCurrent(generation)) navigate(`/posts/${postId}`)
        }
    })
    const onSubmit = (values: PostFormValues, files: File[]) =>
        updateMutation.mutateAsync({
            categoryId: Number(values.categoryId),
            title: values.title.trim(),
            content: values.content.trim(),
            files
        }).catch(() => {
            // The mutation error is displayed above the form.
        })
    return (
        <div className="post-edit-page">
            <h3 className="post-edit-page-title">Post Edit Form</h3>
            {checkingAuthor && <p role="status">작성자 권한을 확인하고 있습니다...</p>}
            {updateMutation.error && (
                <p role="alert">{errorMessage(updateMutation.error, '게시글 수정에 실패했습니다.')}</p>
            )}
            <PostForm
                categoryList={categories}
                register={register}
                errors={errors}
                titleLength={title.length}
                contentLength={content.length}
                savedFiles={post.files}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                submitText={updateMutation.isPending ? '수정 중...' : '수정'}
                disabled={checkingAuthor || authorCheckFailed || updateMutation.isPending}
            />
        </div>
    )
}

function PostEditPage() {
    const { postId = '' } = useParams()
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
    const retryQueries = () => {
        if (postQuery.error) void postQuery.refetch()
        if (categoryQuery.error) void categoryQuery.refetch()
    }
    const queryErrorMessage = queryError && (
        <div role="alert">
            <p>{errorMessage(queryError, '게시글 수정 정보를 불러오지 못했습니다.')}</p>
            <button type="button" onClick={retryQueries}>다시 시도</button>
        </div>
    )
    const postStatus = isAxiosError(postQuery.error) ? postQuery.error.response?.status : undefined
    if (!postQuery.data || !categoryQuery.data || postStatus === 403 || postStatus === 404) {
        return queryErrorMessage
    }
    if (postQuery.isFetching && postQuery.data?.isAuthor !== true) {
        return <p role="status">작성자 권한을 확인하고 있습니다...</p>
    }
    if (postQuery.data?.isAuthor !== true) return <p role="alert">작성자만 게시글을 수정할 수 있습니다.</p>
    return (
        <>
            {queryErrorMessage}
            <EditForm
                key={`${postId}:${auth.generation}`}
                postId={postId}
                post={postQuery.data}
                categories={categoryQuery.data}
                auth={auth}
                checkingAuthor={postQuery.isFetching}
                authorCheckFailed={Boolean(postQuery.error)}
            />
        </>
    )
}

export default PostEditPage
