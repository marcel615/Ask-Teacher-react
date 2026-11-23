import { useState } from 'react'
import { resolvePostFileUrl } from '../api/postApi.ts'
import type { PostAttachment } from '../types/apiTypes'
import './PostAttachments.css'

const imageTypes = ['image/jpeg', 'image/png', 'image/webp']

function AttachmentImage({ url, label }: { url: string; label: string }) {
    const [failed, setFailed] = useState(false)
    if (failed) return <span>{label}을 표시할 수 없습니다.</span>
    return <img src={url} alt={label} loading="lazy" onError={() => setFailed(true)} />
}

function PostAttachments({ files = [], label = '첨부파일' }: { files?: PostAttachment[]; label?: string }) {
    if (!files?.length) return null

    let pdfNumber = 0
    let imageNumber = 0
    return (
        <ul className="post-attachments" aria-label={label}>
            {files.map(file => {
                const url = resolvePostFileUrl(file.fileUrl)
                const isPdf = file.contentType === 'application/pdf'
                const isImage = imageTypes.includes(file.contentType)
                const name = isPdf
                    ? `PDF 첨부 ${++pdfNumber}`
                    : isImage ? `이미지 첨부 ${++imageNumber}` : '첨부파일'

                return (
                    <li key={file.storedFileName}>
                        {!url || (!isPdf && !isImage) ? (
                            <span>{name}을 표시할 수 없습니다.</span>
                        ) : isPdf ? (
                            <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
                        ) : (
                            <AttachmentImage key={url} url={url} label={name} />
                        )}
                    </li>
                )
            })}
        </ul>
    )
}

export default PostAttachments
