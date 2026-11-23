export const postKeys = {
    all: ['posts'],
    lists: ['posts', 'list'],
    list: (keyword: string, categoryId: string, page: number) => ['posts', 'list', keyword, categoryId, page] as const,
    details: ['posts', 'detail'],
    detail: (postId: string | number, generation: number) => ['posts', 'detail', String(postId), generation]
}

export const categoryKeys = {
    all: ['categories']
}

export const commentKeys = {
    all: ['comments'],
    session: (postId: string | number, generation: number) => [...commentKeys.all, String(postId), generation],
    list: (postId: string | number, generation: number, sort: string, page: number) => [...commentKeys.session(postId, generation), sort, page]
}
