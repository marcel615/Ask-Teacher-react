export interface ApiResponse<T = unknown> {
    status: number
    message: string
    data?: T
}

export interface PostSummary {
    postId: number
    title: string
    writerNickname?: string
    categoryName?: string
    newPost?: boolean
    likeCount: number
    createdAt?: string
}

export interface PostPage {
    content: PostSummary[]
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
    isFirst: boolean
    isLast: boolean
}

export interface PostAttachment {
    storedFileName: string
    contentType: string
    fileUrl: string
}

export interface PostDetail {
    postId: number
    id?: number
    categoryId?: number
    categoryName?: string
    title: string
    content: string
    isAuthor: boolean
    likeCount: number
    likedByMe: boolean
    createdAt?: string
    updatedAt?: string
    files?: PostAttachment[]
}

export interface PostCreateRequest {
    categoryId: number
    title: string
    content: string
    files?: File[]
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
    accessToken: string
    tokenType: string
    expiresIn: number
}
