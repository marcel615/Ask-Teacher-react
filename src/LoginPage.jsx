import { useState } from 'react'
import { login } from './api/authApi'
import './LoginPage.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    function validateForm() {
        const trimmedEmail = email.trim()

        if (!trimmedEmail) {
            return '이메일을 입력해 주세요.'
        }

        if (!emailPattern.test(trimmedEmail)) {
            return '올바른 이메일 형식으로 입력해 주세요.'
        }

        if (!password) {
            return '비밀번호를 입력해 주세요.'
        }

        return ''
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const validationMessage = validateForm()
        if (validationMessage) {
            setError(validationMessage)
            return
        }

        setIsLoading(true)
        setError('')

        try {
            await login({
                email: email.trim(),
                password
            })
            alert('로그인에 성공했습니다.')
        } catch (error) {
            const message =
                error.response?.data?.message ||
                '로그인 요청 처리 중 오류가 발생했습니다.'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-form-label" htmlFor="login-email">이메일</label>
                <input
                    id="login-email"
                    className="login-form-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <label className="login-form-label" htmlFor="login-password">비밀번호</label>
                <input
                    id="login-password"
                    className="login-form-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                {error && <p className="login-form-error">{error}</p>}
                <button
                    className="login-form-button"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>
            </form>
        </div>
    )
}

export default LoginPage
