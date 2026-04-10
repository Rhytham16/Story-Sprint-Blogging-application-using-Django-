import { Link } from 'react-router-dom'
import { formatTimeAgo, truncateWords } from '../utils/format'

function HomePostCard({ post }) {
  return (
    <div className="card border-0">
      <div className="card-body">
        <h3>
          <Link to={`/blogs/${post.slug}`} className="text-dark">
            {post.title}
          </Link>
        </h3>
        <small className="mb-1 text-muted">
          {formatTimeAgo(post.created_at)} | {post.author_name}
        </small>
        <p className="card-text">{truncateWords(post.short_description, 25)}</p>
      </div>
    </div>
  )
}

export default HomePostCard
