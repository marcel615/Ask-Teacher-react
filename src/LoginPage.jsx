import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { login } from './api/authApi'
import './LoginPage.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginPage() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: response => {
            alert(response.message || '로그인에 성공했습니다.')
            navigate('/posts')
        }
    })

    const onSubmit = values => {
        loginMutation.mutate({
            email: values.email.trim(),
            password: values.password
        })
    }

    const errorMessage =
        errors.email?.message ||
        errors.password?.message ||
        loginMutation.error?.response?.data?.message ||
        (loginMutation.error ? '로그인에 실패했습니다.' : '')

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="login-form-label" htmlFor="login-email">이메일</label>
                <input
                    id="login-email"
                    className="login-form-input"
                    type="email"
                    {...register('email', {
                        required: '이메일을 입력해 주세요.',
                        pattern: {
                            value: emailPattern,
                            message: '올바른 이메일 형식으로 입력해 주세요.'
                        }
                    })}
                />
                <label className="login-form-label" htmlFor="login-password">비밀번호</label>
                <input
                    id="login-password"
                    className="login-form-input"
                    type="password"
                    {...register('password', {
                        required: '비밀번호를 입력해 주세요.'
                    })}
                />
                {errorMessage && <p className="login-form-error">{errorMessage}</p>}
                <button
                    className="login-form-button"
                    type="submit"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? '로그인 중...' : '로그인'}
                </button>
            </form>
        </div>
    )
}

export default LoginPage
