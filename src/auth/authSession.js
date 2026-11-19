import api from '../api/api.js'
import { createSession } from './session.js'

export const authSession = createSession({ transport: config => api.request(config) })
