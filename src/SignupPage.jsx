import { useState } from 'react'
import posts from './data/posts'
import './SignupPage.css'

function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        console.log({ email, password })
    }

    return (
        <div className="signup-page">
            <form className="signup-form" onSubmit={handleSubmit}>
                <label className="signup-form-label">이메일</label>
                <input className="signup-form-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <label className="signup-form-label">비밀번호</label>
                <input className="signup-form-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button className="signup-form-button" type="submit">회원가입</button>
            </form>
        </div>
    )
}

export default SignupPage