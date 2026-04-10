import { formatTimeAgo } from '../utils/format'

function CommentList({ comments = [] }) {
  if (!comments.length) {
    return <p>No comments yet.</p>
  }

  return comments.map((comment) => (
    <div key={comment.id} className="card mt-1">
      <div className="card-body">
        <p className="card-text mb-0">{comment.comment}</p>
        <span>
          <small>By {comment.user_name}</small>
          <small> | {formatTimeAgo(comment.created_at)}</small>
        </span>
      </div>
    </div>
  ))
}

export default CommentList
