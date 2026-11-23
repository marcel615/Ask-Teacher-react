import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form'
import PostAttachments from './PostAttachments'
import type { Category, PostAttachment } from '../types/apiTypes'
import type { PostFormValues } from '../types/postForm'
import './PostForm.css'

const acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

interface SelectedFile {
    id: number
    file: File
}

interface PostFormProps {
    categoryList?: Category[]
    register: UseFormRegister<PostFormValues>
    errors?: FieldErrors<PostFormValues>
    titleLength?: number
    contentLength?: number
    savedFiles?: PostAttachment[]
    handleSubmit: UseFormHandleSubmit<PostFormValues>
    onSubmit: (values: PostFormValues, files: File[]) => Promise<unknown>
    submitText: string
    disabled?: boolean
}

function PostForm({
    categoryList = [],
    register,
    errors = {},
    titleLength = 0,
    contentLength = 0,
    savedFiles,
    handleSubmit,
    onSubmit,
    submitText,
    disabled = false
}: PostFormProps) {
    const fileInputId = useId()
    const fileErrorId = useId()
    const nextFileId = useRef(0)
    const submitting = useRef(false)
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
    const [fileErrors, setFileErrors] = useState<string[]>([])

    const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget
        const additions: SelectedFile[] = []
        const rejected = []
        for (const file of input.files ?? []) {
            if (!acceptedFileTypes.includes(file.type)) {
                rejected.push(`${file.name}: JPEG, PNG, WebP, PDF 파일만 첨부할 수 있습니다.`)
            } else if (file.size === 0) {
                rejected.push(`${file.name}: 빈 파일은 첨부할 수 없습니다.`)
            } else {
                additions.push({ id: nextFileId.current++, file })
            }
        }
        setSelectedFiles(current => [...current, ...additions])
        setFileErrors(rejected)
        input.value = ''
    }

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (disabled || submitting.current) return
        submitting.current = true
        try {
            await handleSubmit(values => onSubmit(values, selectedFiles.map(({ file }) => file)))(event)
        } finally {
            submitting.current = false
        }
    }

    return (
        <form className="post-form" onSubmit={submit}>
            <label className="post-form-label">카테고리</label>
            <select
                className="post-form-select"
                {...register('categoryId', {
                    required: '카테고리를 선택해 주세요.'
                })}
                disabled={disabled}
            >
                <option value="">카테고리를 선택해 주세요</option>
                {categoryList.map(category => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            {errors.categoryId && (
                <p className="post-form-error">{errors.categoryId.message}</p>
            )}

            <label className="post-form-label">제목</label>
            <input
                className="post-form-input"
                type="text"
                {...register('title', {
                    required: '제목을 입력해 주세요.',
                    validate: value => value.trim() !== '' || '제목은 비어 있을 수 없습니다.',
                    maxLength: {
                        value: 100,
                        message: '제목은 100자 이하로 입력해 주세요.'
                    }
                })}
                maxLength={100}
                disabled={disabled}
            />
            {errors.title && (
                <p className="post-form-error">{errors.title.message}</p>
            )}
            <p className={`post-form-count ${titleLength >= 100 ? 'limit' : ''}`}>
                {titleLength}/100
            </p>

            <label className="post-form-label">내용</label>
            <textarea
                className="post-form-textarea"
                {...register('content', {
                    required: '내용을 입력해 주세요.',
                    validate: value => value.trim() !== '' || '내용은 비어 있을 수 없습니다.',
                    maxLength: {
                        value: 5000,
                        message: '내용은 5000자 이하로 입력해 주세요.'
                    }
                })}
                maxLength={5000}
                disabled={disabled}
            />
            {errors.content && (
                <p className="post-form-error">{errors.content.message}</p>
            )}
            <p className={`post-form-count ${contentLength >= 5000 ? 'limit' : ''}`}>
                {contentLength}/5000
            </p>
            <PostAttachments files={savedFiles} label="저장된 첨부파일" />
            <label className="post-form-label" htmlFor={fileInputId}>첨부파일</label>
            <input
                id={fileInputId}
                type="file"
                accept={acceptedFileTypes.join(',')}
                multiple
                disabled={disabled}
                aria-describedby={fileErrors.length ? fileErrorId : undefined}
                onChange={selectFiles}
            />
            {fileErrors.length > 0 && (
                <ul className="post-form-error" id={fileErrorId} role="alert">
                    {fileErrors.map((message, index) => <li key={index}>{message}</li>)}
                </ul>
            )}
            {selectedFiles.length > 0 && (
                <ul className="post-form-selected-files" aria-label="선택한 파일">
                    {selectedFiles.map(({ id, file }) => (
                        <li key={id}>
                            <span>{file.name}</span>
                            <button
                                type="button"
                                disabled={disabled}
                                aria-label={`${file.name} 제거`}
                                onClick={() => setSelectedFiles(current => current.filter(item => item.id !== id))}
                            >
                                제거
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <button className="post-form-button" type="submit" disabled={disabled}>
                {submitText}
            </button>
        </form>
    )
}

export default PostForm
