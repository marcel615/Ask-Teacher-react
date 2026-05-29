import { useState } from 'react'
import posts from './data/posts'

function SignupPage() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        console.log({ email, password })

        posts.push({
            id: posts.length + 1,
            title: email,
            content: password
        })
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
                <button type="submit">회원가입</button>
            </form>
        </div>
    )


}

export default SignupPage