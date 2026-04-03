import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePost, getDashboardPosts } from '../../api/dashboard'

function PostsPage() {
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadPosts = async () => {
      try {
        const data = await getDashboardPosts()
        if (isMounted) {
          setPosts(data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setPosts([])
          setError('Unable to load posts.')
        }
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [])

  const handleDelete = async (slug) => {
    try {
      await deletePost(slug)
      setPosts((current) => current.filter((post) => post.slug !== slug))
      setError('')
    } catch {
      setError('Unable to delete post.')
    }
  }

  return (
    <section className="py-3">
      <h2>All Posts</h2>
      <Link to="/dashboard/posts/add" className="btn btn-dark text-light float-right mb-2">
        Add New
      </Link>
      {error ? <div className="alert alert-warning">{error}</div> : null}
      <table className="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Category</th>
            <th>Author</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={post.slug}>
              <td>{index + 1}</td>
              <td>{post.title}</td>
              <td>{post.category_name}</td>
              <td>{post.author_name}</td>
              <td>{post.status}</td>
              <td>
                {post.is_featured ? (
                  <i className="fa fa-check text-success" />
                ) : (
                  <i className="fa fa-times text-danger" />
                )}
              </td>
              <td>
                <Link to={`/dashboard/posts/edit/${post.slug}`}>
                  <i className="fa fa-edit text-success" />
                </Link>
                <span>&nbsp;</span>
                <button
                  type="button"
                  className="btn btn-link p-0 border-0 align-baseline"
                  onClick={() => handleDelete(post.slug)}
                >
                  <i className="fa fa-trash text-danger" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default PostsPage
