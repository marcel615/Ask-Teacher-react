import './Header.css'
import {Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authSession } from '../auth/authSession.ts'
import { useAuth } from '../auth/useAuth.ts'
import { errorMessage } from '../auth/session.ts'

const Header = () => {
    const navigate = useNavigate()
    const auth = useAuth()
    const logoutMutation = useMutation({
        mutationFn: () => authSession.logout(),
        onSuccess: () => navigate('/posts')
    })

    return (
        <header className='header'>
            <Link to="/" className='header-title'>Ask Teacher</Link>
            <nav className='header-nav'>
                {auth.status === 'authenticated' || auth.status === 'error' ? (
                    <button className="header-button" disabled={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
                        {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                    </button>
                ) : auth.status === 'checking' ? <span role="status">로그인 확인 중...</span> : <>
                <button className='header-button' onClick={() => navigate('/login')}>
                    로그인
                </button>
                <button className='header-button' onClick={() => navigate('/signup')}>
                    회원가입</button>
                </>}
            </nav>
            {auth.message && <p role="status">{auth.message} <Link to="/login">로그인</Link></p>}
            {logoutMutation.error && <p role="alert">{errorMessage(logoutMutation.error, '로그아웃에 실패했습니다. 다시 시도해 주세요.')}</p>}
        </header>
    )
}

export default Header
