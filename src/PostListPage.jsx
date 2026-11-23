import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getPostPage } from './api/postApi'
import { getCategories } from './api/postCategoryApi'
import { categoryKeys, postKeys } from './api/queryKeys'
import { errorMessage } from './auth/session'
import './PostListPage.css'

const FIRST_PAGE = 1
// Spring Data's JPA query offset is an int. Resolve larger offsets from page metadata.
const MAX_REQUEST_PAGE = Math.floor(2147483647 / 10) + 1

const formatDateTime = dateTime => dateTime?.replace('T', ' ').slice(0, 16) || ''

function readPage(value) {
    if (!/^\d+$/.test(value ?? '') || Number(value) < FIRST_PAGE) return FIRST_PAGE
    return Math.min(Number(value), MAX_REQUEST_PAGE + 1)
}

function updatePage(params, page) {
    if (page === FIRST_PAGE) params.delete('page')
    else params.set('page', String(page))
}

function PostSearchForm({ keyword, categoryId, categories, onSearch }) {
    const [draftKeyword, setDraftKeyword] = useState(keyword)
    const [draftCategory, setDraftCategory] = useState(categoryId)
    const hasDraftCategory = categories.data?.some(category => String(category.id) === draftCategory)

    const handleSubmit = event => {
        event.preventDefault()
        onSearch(draftKeyword.trim(), draftCategory)
    }

    return (
        <form className="post-list-search" onSubmit={handleSubmit} role="search" aria-label="게시글 검색">
            <label>
                검색어
                <input
                    type="search"
                    value={draftKeyword}
                    onChange={event => setDraftKeyword(event.target.value)}
                    placeholder="제목 또는 내용"
                />
            </label>
            <label>
                카테고리
                <select value={draftCategory} onChange={event => setDraftCategory(event.target.value)}>
                    <option value="">전체 카테고리</option>
                    {draftCategory && !hasDraftCategory && (
                        <option value={draftCategory}>카테고리 #{draftCategory}</option>
                    )}
                    {categories.data?.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </label>
            <button type="submit">검색</button>
            {categories.isPending && <p role="status">카테고리를 불러오는 중...</p>}
            {categories.isError && (
                <div className="post-list-feedback">
                    <p role="alert">{errorMessage(categories.error, '카테고리를 불러오지 못했습니다.')}</p>
                    <button type="button" onClick={() => categories.refetch()} disabled={categories.isFetching}>
                        카테고리 다시 시도
                    </button>
                </div>
            )}
        </form>
    )
}

function PostPagination({ page, lastPage, onPageChange }) {
    const firstVisible = Math.max(FIRST_PAGE, Math.min(page - 2, lastPage - 4))
    const lastVisible = Math.min(firstVisible + 4, lastPage)
    const pageNumbers = Array.from({ length: lastVisible - firstVisible + 1 }, (_, index) => firstVisible + index)

    return (
        <nav className="post-list-pagination" aria-label="게시글 페이지">
            <button type="button" disabled={page === FIRST_PAGE} onClick={() => onPageChange(FIRST_PAGE)}>처음</button>
            <button type="button" disabled={page === FIRST_PAGE} onClick={() => onPageChange(page - 1)}>이전</button>
            {pageNumbers.map(number => (
                <button
                    type="button"
                    key={number}
                    aria-label={`${number}페이지`}
                    aria-current={number === page ? 'page' : undefined}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </button>
            ))}
            <button type="button" disabled={page === lastPage} onClick={() => onPageChange(page + 1)}>다음</button>
            <button type="button" disabled={page === lastPage} onClick={() => onPageChange(lastPage)}>마지막</button>
        </nav>
    )
}

const PostListPage = () => {
    const navigate = useNavigate()
    const { key: locationKey, state: locationState } = useLocation()
    const formKey = locationState?.postSearchFormKey ?? locationKey
    const [searchParams, setSearchParams] = useSearchParams()
    const keyword = searchParams.get('keyword')?.trim() || ''
    const categoryId = searchParams.get('categoryId') || ''
    const rawPage = searchParams.get('page')
    const page = readPage(rawPage)
    const requestPage = page > MAX_REQUEST_PAGE ? FIRST_PAGE : page

    const posts = useQuery({
        queryKey: postKeys.list(keyword, categoryId, requestPage),
        queryFn: ({ signal }) => getPostPage({
            keyword: keyword || undefined,
            categoryId: categoryId || undefined,
            page: requestPage - 1
        }, signal),
        retry: false,
        networkMode: 'always'
    })
    const categories = useQuery({
        queryKey: categoryKeys.all,
        queryFn: getCategories,
        retry: false,
        networkMode: 'always'
    })
    const lastPage = Math.max(FIRST_PAGE, Math.min(posts.data?.totalPages ?? 0, MAX_REQUEST_PAGE))
    const displayedPage = posts.isSuccess ? Math.min(page, lastPage) : page
    const isCorrectingPage = displayedPage !== page

    useEffect(() => {
        const canonicalPage = displayedPage === FIRST_PAGE ? null : String(displayedPage)
        if (rawPage === canonicalPage || (page > MAX_REQUEST_PAGE && !posts.isSuccess)) return
        if (isCorrectingPage && posts.isFetching) return

        const nextParams = new URLSearchParams(searchParams)
        updatePage(nextParams, displayedPage)
        setSearchParams(nextParams, {
            replace: true,
            state: { ...locationState, postSearchFormKey: formKey }
        })
    }, [displayedPage, formKey, isCorrectingPage, locationState, page, posts.isFetching, posts.isSuccess, rawPage,
        searchParams, setSearchParams])

    const handleSearch = (nextKeyword, nextCategoryId) => {
        const nextParams = new URLSearchParams(searchParams)
        if (nextKeyword) nextParams.set('keyword', nextKeyword)
        else nextParams.delete('keyword')
        if (nextCategoryId) nextParams.set('categoryId', nextCategoryId)
        else nextParams.delete('categoryId')
        updatePage(nextParams, FIRST_PAGE)

        if (nextParams.toString() === searchParams.toString()) void posts.refetch()
        else setSearchParams(nextParams)
    }

    const handlePageChange = nextPage => {
        if (nextPage === page) return
        const nextParams = new URLSearchParams(searchParams)
        updatePage(nextParams, nextPage)
        setSearchParams(nextParams)
    }

    const categoryNotFound = categoryId && posts.error?.response?.status === 404

    return (
        <div className="post-list-page">
            <div className="post-list-header">
                <h3 className="post-list-title">Post List</h3>
                <button type="button" className="post-list-create-button" onClick={() => navigate('/posts/create')}>
                    새 글 작성
                </button>
            </div>
            <PostSearchForm
                key={formKey}
                keyword={keyword}
                categoryId={categoryId}
                categories={categories}
                onSearch={handleSearch}
            />
            {(posts.isPending || isCorrectingPage) && <p role="status">게시글을 불러오는 중...</p>}
            {posts.isError && (
                <div className="post-list-feedback">
                    <p role="alert">{errorMessage(posts.error, '게시글 목록을 불러오지 못했습니다.')}</p>
                    {categoryNotFound && <p>사용할 수 없는 카테고리입니다. 전체 카테고리를 선택해 다시 검색해 주세요.</p>}
                    <button type="button" onClick={() => posts.refetch()} disabled={posts.isFetching}>
                        게시글 다시 시도
                    </button>
                </div>
            )}
            {posts.isSuccess && !isCorrectingPage && (
                <>
                    <div className="post-list">
                        {posts.data.content.length === 0 && (
                            <p className="post-list-empty" role="status">
                                {keyword || categoryId ? '검색 조건에 맞는 게시글이 없습니다.' : '게시글이 없습니다.'}
                            </p>
                        )}
                        {posts.data.content.map(post => (
                            <div className="post-item" key={post.postId}>
                                <p className="post-item-created-at">{formatDateTime(post.createdAt)}</p>
                                <Link className="post-title-link" to={`/posts/${post.postId}`}>
                                    {post.title}
                                    {post.newPost && <span className="post-new-badge">new</span>}
                                </Link>
                                {post.writerNickname && <p className="post-item-writer">{post.writerNickname}</p>}
                                <p className="post-item-like-count">좋아요 {post.likeCount}</p>
                            </div>
                        ))}
                    </div>
                    <PostPagination page={page} lastPage={lastPage} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    )
}

export default PostListPage
