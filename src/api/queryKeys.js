export const postKeys = {
    all: ['posts'],
    lists: ['posts', 'list'],
    list: (keyword, categoryId, page) => ['posts', 'list', keyword, categoryId, page],
    details: ['posts', 'detail'],
    detail: (postId, generation) => ['posts', 'detail', String(postId), generation]
}

export const categoryKeys = {
    all: ['categories']
}

export const commentKeys = {
    all: ['comments'],
    session: (postId, generation) => [...commentKeys.all, String(postId), generation],
    list: (postId, generation, sort, page) => [...commentKeys.session(postId, generation), sort, page]
}
