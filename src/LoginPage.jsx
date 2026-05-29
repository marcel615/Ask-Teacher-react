import {useState} from 'react'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        console.log({ email, password })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>이메일</label>
                <input 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <label>비밀번호</label>
                <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">로그인</button>
            </form>
        </div>
    )
}

export default LoginPage