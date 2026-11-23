import api from '../api/api.ts'
import { createSession } from './session.ts'

export const authSession = createSession({ transport: config => api.request(config) })
