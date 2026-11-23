export interface AuthSnapshot {
    status: 'checking' | 'anonymous' | 'authenticated' | 'error'
    accessToken: string | null
    userId: string | null
    generation: number
    message: string
}
