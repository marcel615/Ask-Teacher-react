import api from './api'

/**
 * @typedef {import('../types/apiTypes').SignupRequest} SignupRequest
 * @typedef {import('../types/apiTypes').LoginRequest} LoginRequest
 */

/**
 * @param {SignupRequest} signupData
 */
export const signup = async (signupData) => {
    const response = await api.post('/auth/signup', signupData)
    return response.data
}

/**
 * @param {LoginRequest} loginData
 */
export const login = async (loginData) => {
    const response = await api.post('/auth/login', loginData)
    return response.data
}
