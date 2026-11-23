import assert from 'node:assert/strict'
import test from 'node:test'
import api from '../src/api/api.ts'
import { postFormData, resolvePostFileUrl } from '../src/api/postApi.ts'

const post = { categoryId: 1, title: '제목', content: '내용' }

test('posts without attachments omit the optional multipart field', () => {
    const form = postFormData(post)
    assert.deepEqual([...form], [['categoryId', '1'], ['title', '제목'], ['content', '내용']])
    assert.equal(postFormData({ ...post, files: [] }).has('files'), false)
})

test('posts append each selected file under the same multipart field', () => {
    const image = new File(['image'], 'image.png', { type: 'image/png' })
    const pdf = new File(['pdf'], 'attachment.pdf', { type: 'application/pdf' })
    const form = postFormData({ ...post, files: [image, pdf] })
    assert.deepEqual(form.getAll('files'), [image, pdf])
})

test('public attachment URLs use the backend origin and HTTP scheme', () => {
    const { origin } = new URL(api.defaults.baseURL)
    assert.equal(resolvePostFileUrl('/files/image.png'), `${origin}/files/image.png`)
    assert.equal(resolvePostFileUrl('files/attachment.pdf'), `${origin}/files/attachment.pdf`)
    assert.equal(resolvePostFileUrl(`${origin}/files/image.png`), `${origin}/files/image.png`)
    assert.equal(resolvePostFileUrl('https://example.test/files/image.png'), null)
    assert.equal(resolvePostFileUrl(`blob:${origin}/image.png`), null)
    assert.equal(resolvePostFileUrl('javascript:void(0)'), null)
    assert.equal(resolvePostFileUrl(''), null)
})
