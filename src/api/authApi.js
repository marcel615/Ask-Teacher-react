import api from './api.js'
import { authSession } from '../auth/authSession.js'

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
    return authSession.login(loginData)
}
