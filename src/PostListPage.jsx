import posts  from './data/posts'
import { useState } from 'react'
import {Link} from 'react-router-dom'

const PostListPage = () => {
    const [postList, setPostList] = useState(posts)
    
    return (
        <div>
            <h3>Post List Page</h3>
            {postList.map( post => (
                <div key={post.id}>
                    <Link to={'/posts/' + post.id}>
                        {post.title}
                    </Link>
                    <p>{post.content}</p>
                </div>
            ))}
        </div>
    )
}

export default PostListPage