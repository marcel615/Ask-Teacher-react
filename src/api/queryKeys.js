export const postKeys = {
    all: ['posts'],
    details: ['posts', 'detail'],
    detail: (postId, generation) => ['posts', 'detail', String(postId), generation]
}

export const categoryKeys = {
    all: ['categories']
}
