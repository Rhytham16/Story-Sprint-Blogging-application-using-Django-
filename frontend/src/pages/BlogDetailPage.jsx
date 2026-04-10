import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import CommentForm from '../components/CommentForm'
import CommentList from '../components/CommentList'
import SocialLinks from '../components/SocialLinks'
import { createComment, getPostDetail } from '../api/site'

function BlogDetailPage() {
  const { slug } = useParams()
  const { currentUser, siteMeta } = useOutletContext()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadPost = async () => {
      setIsLoading(true)

      try {
        const data = await getPostDetail(slug)
        if (isMounted) {
          setPost(data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setPost(null)
          setError('Unable to load this post right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPost()

    return () => {
      isMounted = false
    }
  }, [slug])

  const handleCommentSubmit = async (comment) => {
    setIsSubmittingComment(true)

    try {
      const createdComment = await createComment(slug, comment)
      setPost((current) => ({
        ...current,
        comments: [createdComment, ...(current?.comments ?? [])],
        comment_count: (current?.comment_count ?? 0) + 1,
      }))
      setError('')
      return true
    } catch (requestError) {
      setError(
        requestError.status === 401
          ? 'Please login to write a comment.'
          : 'Unable to submit your comment right now.',
      )
      return false
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const categoryLinks = useMemo(
    () => siteMeta.categories ?? [],
    [siteMeta.categories],
  )

  return (
    <main>
      <div className="container mt-5">
        {isLoading ? <div className="py-3 text-muted">Loading post...</div> : null}
        {error ? <div className="alert alert-warning">{error}</div> : null}

        {post ? (
          <div className="row">
            <div className="col-lg-8">
              <article>
                <header className="mb-4">
                  <h1 className="fw-bolder mb-1">{post.title}</h1>
                  <div className="text-muted fst-italic mb-2">
                    Posted on {new Date(post.created_at).toLocaleString()} by {post.author_name}
                  </div>
                  <span className="badge bg-warning text-decoration-none text-light">
                    {post.category_name}
                  </span>
                </header>
                <figure className="mb-4">
                  <img className="img-fluid rounded" src={post.featured_image} alt={post.title} />
                </figure>
                <section className="mb-5">
                  <p className="fs-5 mb-4">{post.short_description}</p>
                  <p className="fs-5 mb-4">{post.blog_body}</p>

                  <h4>Comments ({post.comment_count})</h4>
                  <CommentList comments={post.comments} />
                  <br />

                  <div className="form-group">
                    {currentUser ? (
                      <CommentForm
                        onSubmit={handleCommentSubmit}
                        isSubmitting={isSubmittingComment}
                      />
                    ) : (
                      <p>
                        Please <Link to="/login">login</Link> to write a comment!
                      </p>
                    )}
                  </div>
                </section>
              </article>
            </div>

            <div className="col-lg-4">
              <div className="card mb-4 p-3">
                <h4 className="font-italic">Categories</h4>
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-6">
                      <ul className="list-unstyled mb-0">
                        {categoryLinks.map((category) => (
                          <li key={category.id}>
                            <Link to={`/category/${category.id}`}>{category.category_name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {siteMeta.social_links?.length ? (
                <div className="card mb-4 p-3">
                  <SocialLinks links={siteMeta.social_links} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default BlogDetailPage
