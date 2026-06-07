import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from './api/authApi'
import './SignupPage.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SignupPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    function validateForm() {
        const trimmedEmail = email.trim()
        const trimmedNickname = nickname.trim()

        if (!trimmedEmail) {
            return '이메일을 입력해 주세요.'
        }

        if (!emailPattern.test(trimmedEmail)) {
            return '올바른 이메일 형식으로 입력해 주세요.'
        }

        if (!password) {
            return '비밀번호를 입력해 주세요.'
        }

        if (password.length < 8) {
            return '비밀번호는 8자 이상 입력해 주세요.'
        }

        if (!trimmedNickname) {
            return '닉네임을 입력해 주세요.'
        }

        if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
            return '닉네임은 2자 이상 20자 이하로 입력해 주세요.'
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
            await signup({
                email: email.trim(),
                password,
                nickname: nickname.trim()
            })
            navigate('/posts')
        } catch (error) {
            const message =
                error.response?.data?.message ||
                '요청 처리 중 오류가 발생했습니다.'
            setError(message)
            alert('회원가입 실패')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="signup-page">
            <form className="signup-form" onSubmit={handleSubmit}>
                <label className="signup-form-label" htmlFor="signup-nickname">닉네임</label>
                <input
                    id="signup-nickname"
                    className="signup-form-input"
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    required
                    minLength={2}
                    maxLength={20}
                />
                <label className="signup-form-label" htmlFor="signup-email">이메일</label>
                <input
                    id="signup-email"
                    className="signup-form-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <label className="signup-form-label" htmlFor="signup-password">비밀번호</label>
                <input
                    id="signup-password"
                    className="signup-form-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                />
                {error && <p className="signup-form-error">{error}</p>}
                <button
                    className="signup-form-button"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? '회원가입 중...' : '회원가입'}
                </button>
            </form>
        </div>
    )
}

export default SignupPage
