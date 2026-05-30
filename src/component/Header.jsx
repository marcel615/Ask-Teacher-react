import './Header.css'
import {Link, useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()
    
    return (
        <header className='header'>
            <Link to="/" className='header-title'>Ask Teacher</Link>
            <nav className='header-nav'>
                <button className='header-button' onClick={() => navigate('/login')}>
                    로그인
                </button>
                <button className='header-button' onClick={() => navigate('/signup')}>
                    회원가입</button>
            </nav>
        </header>
    )
}

export default Header