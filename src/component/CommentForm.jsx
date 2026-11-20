import { useId } from 'react'
import { useForm } from 'react-hook-form'

function CommentForm({ initialContent = '', onSubmit, onCancel, disabled }) {
    const contentId = useId()
    const errorId = `${contentId}-error`
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { content: initialContent }
    })
    const label = onCancel ? '댓글 수정' : '댓글 작성'

    const submit = async ({ content }) => {
        const saved = await onSubmit(content)
        if (saved && !onCancel) reset()
    }

    return (
        <form className="comment-form" onSubmit={handleSubmit(submit)} noValidate>
            <label htmlFor={contentId}>{label}</label>
            <textarea
                id={contentId}
                rows={3}
                disabled={disabled}
                aria-invalid={Boolean(errors.content)}
                aria-describedby={errors.content ? errorId : undefined}
                {...register('content', {
                    validate: value => value.trim() !== '' || '댓글 내용을 입력해 주세요.',
                    maxLength: { value: 1000, message: '댓글은 1,000자 이하로 입력해 주세요.' }
                })}
            />
            {errors.content && <p id={errorId} role="alert">{errors.content.message}</p>}
            <div className="comment-actions">
                <button type="submit" disabled={disabled}>{onCancel ? '수정 저장' : '댓글 등록'}</button>
                {onCancel && <button type="button" disabled={disabled} onClick={onCancel}>취소</button>}
            </div>
        </form>
    )
}

export default CommentForm
