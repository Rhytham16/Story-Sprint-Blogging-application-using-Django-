import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { getPosts } from '../api/site'
import HomePostCard from '../components/HomePostCard'

function CategoryPostsPage() {
  const { categoryId } = useParams()
  const { siteMeta } = useOutletContext()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCategoryPosts = async () => {
      setIsLoading(true)

      try {
        const results = await getPosts({ category: categoryId })
        if (isMounted) {
          setPosts(results)
          setError('')
        }
      } catch {
        if (isMounted) {
          setPosts([])
          setError('Unable to load category posts right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCategoryPosts()

    return () => {
      isMounted = false
    }
  }, [categoryId])

  const categoryName = useMemo(() => {
    const category = siteMeta.categories.find(
      (item) => String(item.id) === String(categoryId),
    )
    return category?.category_name ?? categoryId
  }, [categoryId, siteMeta.categories])

  return (
    <main>
      <h3 className="text-uppercase text-warning" style={{ letterSpacing: '2px' }}>
        Category - {categoryName}
      </h3>

      {isLoading ? <div className="py-3 text-muted">Loading category posts...</div> : null}
      {error ? <div className="alert alert-warning">{error}</div> : null}

      <div className="row mb-2">
        {posts.length ? (
          posts.map((post) => (
            <div key={post.id} className="col-md-6">
              <HomePostCard post={post} />
            </div>
          ))
        ) : (
          !isLoading && <p>No posts found</p>
        )}
      </div>
    </main>
  )
}

export default CategoryPostsPage
