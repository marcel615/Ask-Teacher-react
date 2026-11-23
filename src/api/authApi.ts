import api from './api.ts'
import { authSession } from '../auth/authSession.ts'

import type { LoginRequest, SignupRequest, SignupResult } from '../types/apiTypes'

export const signup = async (signupData: SignupRequest) => {
    const response = await api.post<SignupResult>('/auth/signup', signupData)
    return response.data
}

export const login = async (loginData: LoginRequest) => {
    return authSession.login(loginData)
}
