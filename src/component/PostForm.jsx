import {useState} from 'react'

function PostForm({
    title, 
    setTitle, 
    content, 
    setContent, 
    onSubmit, 
    submitText
}) {

    return (
        <div>
            <form onSubmit={onSubmit}>
                <label>제목</label>
                <input 
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <label>내용</label>
                <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <button type="submit">{submitText}</button>
            </form>
        </div>
    )
}

export default PostForm