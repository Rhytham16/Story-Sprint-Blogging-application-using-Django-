import { useState } from 'react'

function CommentForm({ onSubmit, isSubmitting }) {
  const [comment, setComment] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed) {
      return
    }

    const didSubmit = await onSubmit(trimmed)
    if (didSubmit) {
      setComment('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <textarea
          name="comment"
          className="form-control"
          placeholder="Write your comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isSubmitting}
        />
        <input
          type="submit"
          value={isSubmitting ? 'Submitting...' : 'Submit'}
          className="btn btn-primary mt-2"
          disabled={isSubmitting}
        />
      </div>
    </form>
  )
}

export default CommentForm
