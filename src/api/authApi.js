import api from './api'

export const signup = async (signupData) => {
    const response = await api.post('/auth/signup', signupData)
    return response.data
}

export const login = async (loginData) => {
    const response = await api.post('/auth/login', loginData)
    return response.data
}
