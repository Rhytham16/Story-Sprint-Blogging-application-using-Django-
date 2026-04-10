import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchPosts } from '../api/site'
import HomePostCard from '../components/HomePostCard'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') ?? ''
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadResults = async () => {
      if (!keyword.trim()) {
        setPosts([])
        setError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const results = await searchPosts(keyword)
        if (isMounted) {
          setPosts(results)
          setError('')
        }
      } catch {
        if (isMounted) {
          setPosts([])
          setError('Unable to load search results right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      isMounted = false
    }
  }, [keyword])

  return (
    <main>
      <h3 className="text-warning" style={{ letterSpacing: '2px' }}>
        Search Term - {keyword}
      </h3>

      {isLoading ? <div className="py-3 text-muted">Loading search results...</div> : null}
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

export default SearchPage
