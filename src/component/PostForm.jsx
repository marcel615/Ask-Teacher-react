import {useState} from 'react'
import './PostForm.css'

function PostForm({
    categoryId,
    setCategoryId,
    categoryList,
    title, 
    setTitle, 
    content, 
    setContent, 
    onSubmit, 
    submitText
}) {

    return (
        <form className="post-form" onSubmit={onSubmit}>
            <label className="post-form-label">카테고리</label>
            <select className="post-form-select" 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
            >
                <option value="">카테고리를 선택해주세요</option>
                {categoryList.map(category => (
                    <option key={category.id}
                        value={category.id}
                    >
                        {category.name}
                    </option>
                ))}
            </select>

            <label className="post-form-label">제목</label>
            <input className="post-form-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
                required
                pattern=".*\S.*"
                title="제목은 비어 있을 수 없습니다."
            />
            <p className={`post-form-count ${title.length >= 100 ? 'limit' : ''}`}>
                {title.length}/100
            </p>

            <label className="post-form-label">내용</label>
            <textarea className="post-form-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={5000}
                required
            />
            <p className={`post-form-count ${content.length >= 5000 ? 'limit' : ''}`}>
                {content.length}/5000
            </p>
            <button className="post-form-button" type="submit">{submitText}</button>
        </form>
    )
}

export default PostForm