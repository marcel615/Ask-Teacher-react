import PostListPage from './PostListPage'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const navigate = useNavigate()

    return (
        <div>
            <PostListPage />
        </div>
    )
}

export default HomePage