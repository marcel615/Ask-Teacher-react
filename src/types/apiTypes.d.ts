export interface ApiResponse<T = unknown> {
    status: number
    message: string
    data?: T
}

export interface PostSummary {
    postId: number
    title: string
    writerNickname?: string
    newPost?: boolean
    createdAt?: string
}

export interface PostDetail {
    postId: number
    id?: number
    categoryId?: number
    categoryName?: string
    title: string
    content: string
    createdAt?: string
    updatedAt?: string
}

export interface PostCreateRequest {
    userId: number
    categoryId: number
    title: string
    content: string
}

export interface PostUpdateRequest extends PostCreateRequest {}

export interface Category {
    id: number
    name: string
}

export interface SignupRequest {
    email: string
    password: string
    nickname: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    userId: number
    email: string
    nickname: string
}
