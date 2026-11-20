import CommentForm from './CommentForm.jsx'

function CommentItem({
    comment,
    liked,
    canManage,
    editing,
    anotherEditOpen,
    disabled,
    onLike,
    onEdit,
    onSave,
    onCancel,
    onDelete
}) {
    return (
        <li>
            <div className="comment-meta">
                <strong>{comment.writerNickname}</strong>
                <time dateTime={comment.createdAt}>
                    {comment.createdAt?.replace('T', ' ').slice(0, 16)}
                </time>
            </div>
            {canManage && editing ? (
                <CommentForm
                    initialContent={comment.content}
                    disabled={disabled}
                    onSubmit={onSave}
                    onCancel={onCancel}
                />
            ) : (
                <p className="comment-content">{comment.content}</p>
            )}
            <div className="comment-actions">
                <button
                    type="button"
                    aria-label={`${comment.writerNickname} 댓글 좋아요 ${comment.likeCount}`}
                    aria-pressed={liked}
                    disabled={disabled}
                    onClick={onLike}
                >
                    <span aria-hidden="true">{liked ? '♥' : '♡'}</span> 좋아요 {comment.likeCount}
                </button>
                {canManage && !editing && (
                    <>
                        <button type="button" disabled={disabled || anotherEditOpen} onClick={onEdit}>
                            수정
                        </button>
                        <button type="button" disabled={disabled || anotherEditOpen} onClick={onDelete}>
                            삭제
                        </button>
                    </>
                )}
            </div>
        </li>
    )
}

export default CommentItem
