import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { signup } from './api/authApi'
import './SignupPage.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SignupPage() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            nickname: '',
            email: '',
            password: ''
        }
    })

    const signupMutation = useMutation({
        mutationFn: signup,
        onSuccess: () => {
            navigate('/posts')
        },
        onError: () => {
            alert('회원가입 실패')
        }
    })

    const onSubmit = values => {
        signupMutation.mutate({
            email: values.email.trim(),
            password: values.password,
            nickname: values.nickname.trim()
        })
    }

    const errorMessage =
        errors.nickname?.message ||
        errors.email?.message ||
        errors.password?.message ||
        signupMutation.error?.response?.data?.message ||
        (signupMutation.error ? '회원가입에 실패했습니다.' : '')

    return (
        <div className="signup-page">
            <form className="signup-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="signup-form-label" htmlFor="signup-nickname">닉네임</label>
                <input
                    id="signup-nickname"
                    className="signup-form-input"
                    type="text"
                    {...register('nickname', {
                        required: '닉네임을 입력해 주세요.',
                        validate: value => value.trim() !== '' || '닉네임은 비어 있을 수 없습니다.',
                        minLength: {
                            value: 2,
                            message: '닉네임은 2자 이상 입력해 주세요.'
                        },
                        maxLength: {
                            value: 20,
                            message: '닉네임은 20자 이하로 입력해 주세요.'
                        }
                    })}
                />
                <label className="signup-form-label" htmlFor="signup-email">이메일</label>
                <input
                    id="signup-email"
                    className="signup-form-input"
                    type="email"
                    {...register('email', {
                        required: '이메일을 입력해 주세요.',
                        pattern: {
                            value: emailPattern,
                            message: '올바른 이메일 형식으로 입력해 주세요.'
                        }
                    })}
                />
                <label className="signup-form-label" htmlFor="signup-password">비밀번호</label>
                <input
                    id="signup-password"
                    className="signup-form-input"
                    type="password"
                    {...register('password', {
                        required: '비밀번호를 입력해 주세요.',
                        minLength: {
                            value: 8,
                            message: '비밀번호는 8자 이상 입력해 주세요.'
                        }
                    })}
                />
                {errorMessage && <p className="signup-form-error">{errorMessage}</p>}
                <button
                    className="signup-form-button"
                    type="submit"
                    disabled={signupMutation.isPending}
                >
                    {signupMutation.isPending ? '회원가입 중...' : '회원가입'}
                </button>
            </form>
        </div>
    )
}

export default SignupPage
