import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createPost } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { categoryKeys, postKeys } from './api/queryKeys'
import PostForm from './component/PostForm'
import { authSession } from './auth/authSession.js'
import { useAuth } from './auth/useAuth.js'
import { usePostDraft } from './auth/usePostDraft.js'
import { errorMessage, SessionError } from './auth/session.js'
import './PostCreatePage.css'

function CreateForm({ auth }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm({
        defaultValues: authSession.readDraft('create', auth.userId) || {
            categoryId: '',
            title: '',
            content: ''
        }
    })

    const {
        data: categoryList,
        isLoading: isCategoryLoading,
        error: categoryError,
        refetch: refetchCategories
    } = useQuery({
        queryKey: categoryKeys.all,
        queryFn: getCategories
    })

    const createMutation = useMutation({
        mutationFn: async values => {
            if (!authSession.isCurrent(auth.generation)) {
                throw new SessionError('로그인 상태가 변경되었습니다.')
            }
            return { response: await createPost(values), generation: auth.generation }
        },
        onSuccess: async ({ generation }) => {
            if (!authSession.isCurrent(generation)) return
            authSession.clearDraft('create')
            await queryClient.invalidateQueries({ queryKey: postKeys.all })
            if (!authSession.isCurrent(generation)) return
            alert('게시글이 성공적으로 작성되었습니다.')
            navigate('/posts')
        }
    })
    const { title = '', content = '' } = usePostDraft('create', auth.userId, control)

    const onSubmit = (values, files) =>
        createMutation.mutateAsync({
            categoryId: Number(values.categoryId),
            title: values.title.trim(),
            content: values.content.trim(),
            files
        }).catch(() => {
            // The mutation error is displayed above the form.
        })

    if (isCategoryLoading) {
        return <div className="post-create-page">로딩 중...</div>
    }

    const mutationError =
        (createMutation.error ? errorMessage(createMutation.error, '게시글 작성에 실패했습니다.') : '')

    return (
        <div className="post-create-page">
            <h3 className="post-create-title">Post Create Page</h3>
            {categoryError && (
                <div role="alert">
                    <p>{errorMessage(categoryError, '카테고리 목록을 불러오지 못했습니다.')}</p>
                    <button type="button" onClick={() => void refetchCategories()}>다시 시도</button>
                </div>
            )}
            {mutationError && (
                <p className="error-message" role="alert">{mutationError}</p>
            )}
            {categoryList && (
                <PostForm
                    categoryList={categoryList}
                    register={register}
                    errors={errors}
                    titleLength={title.length}
                    contentLength={content.length}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
                    submitText={createMutation.isPending ? '작성 중...' : '작성'}
                    disabled={createMutation.isPending}
                />
            )}
        </div>
    )
}

function PostCreatePage() {
    const auth = useAuth()
    return <CreateForm key={auth.generation} auth={auth} />
}

export default PostCreatePage
