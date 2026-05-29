import PostListPage from './PostListPage'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const navigate = useNavigate()

    return (
        <div>
            <button onClick={() => navigate('/login')}>로그인</button>
            <button onClick={() => navigate('/signup')}>회원가입</button>
            <PostListPage />
        </div>
    )
}

export default HomePage