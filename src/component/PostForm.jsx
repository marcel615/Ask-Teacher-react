import {useState} from 'react'
import './PostForm.css'

function PostForm({
    title, 
    setTitle, 
    content, 
    setContent, 
    onSubmit, 
    submitText
}) {

    return (
        <form className="post-form" onSubmit={onSubmit}>
            <label className="post-form-label">제목</label>
            <input className="post-form-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <label className="post-form-label">내용</label>
            <textarea className="post-form-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            <button className="post-form-button" type="submit">{submitText}</button>
        </form>
    )
}

export default PostForm