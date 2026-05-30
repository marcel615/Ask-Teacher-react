import {useState} from 'react'
import './LoginPage.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        console.log({ email, password })
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-form-label">이메일</label>
                <input className="login-form-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <label className="login-form-label">비밀번호</label>
                <input 
                    className="login-form-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button className="login-form-button" type="submit">로그인</button>
            </form>
        </div>
    )
}

export default LoginPage