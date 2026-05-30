import posts  from './data/posts'
import { useState } from 'react'
import {Link, useNavigate } from 'react-router-dom'
import './PostListPage.css'

const PostListPage = () => {
    const [postList, setPostList] = useState(posts)
    const navigate = useNavigate()

    return (
        <div className='post-list-page'>
            <div className='post-list-header'>
                <h3 className='post-list-title'>Post List</h3>
                <button className='post-list-create-button' onClick={() => navigate('/posts/create')}>
                    새 글 작성
                </button>            
            </div>
            <div className='post-list'>
                {postList.map( post => (
                    <div className='post-item' key={post.id}>
                        <Link className='post-title-link' to={`/posts/${post.id}`}>
                            {post.title}
                        </Link>
                        {/* <p className='post-content'>{post.content}</p> */}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PostListPage