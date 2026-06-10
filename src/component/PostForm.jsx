import './PostForm.css'

function PostForm({
    categoryList = [],
    register,
    errors = {},
    titleLength = 0,
    contentLength = 0,
    onSubmit,
    submitText,
    disabled = false
}) {
    return (
        <form className="post-form" onSubmit={onSubmit}>
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
            <button className="post-form-button" type="submit" disabled={disabled}>
                {submitText}
            </button>
        </form>
    )
}

export default PostForm
