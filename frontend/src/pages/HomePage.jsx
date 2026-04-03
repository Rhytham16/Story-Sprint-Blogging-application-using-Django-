import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { getPosts } from '../api/site'
import HomePostCard from '../components/HomePostCard'
import SidebarAbout from '../components/SidebarAbout'
import SocialLinks from '../components/SocialLinks'
import { truncateWords } from '../utils/format'

function HomePage() {
  const { siteMeta } = useOutletContext()
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadHomePage = async () => {
      try {
        const [featured, recent] = await Promise.all([
          getPosts({ featured: 'true' }),
          getPosts(),
        ])

        if (!isMounted) {
          return
        }

        setFeaturedPosts(featured)
        setRecentPosts(recent.filter((post) => !post.is_featured))
        setError('')
      } catch {
        if (isMounted) {
          setError('Unable to load posts right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHomePage()

    return () => {
      isMounted = false
    }
  }, [])

  const heroPost = featuredPosts[0]
  const secondaryFeaturedPosts = featuredPosts.slice(1)

  return (
    <main>
      {isLoading ? (
        <div className="py-5 text-center text-muted">Loading home page...</div>
      ) : null}
      {error ? <div className="alert alert-warning">{error}</div> : null}

      {heroPost ? (
        <div
          className="jumbotron p-3 p-md-5 text-white rounded bg-dark"
          style={{
            backgroundImage: `url(${heroPost.featured_image})`,
            backgroundBlendMode: 'overlay',
            backgroundSize: 'cover',
          }}
        >
          <div className="col-md-8 px-0">
            <h1 className="display-4 font-italic">{heroPost.title}</h1>
            <p className="lead my-3">
              {truncateWords(heroPost.short_description, 25)}
            </p>
            <p className="lead mb-0">
              <Link
                to={`/blogs/${heroPost.slug}`}
                className="text-white font-weight-bold"
              >
                Continue reading...
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      <h3 className="text-uppercase text-warning" style={{ letterSpacing: '2px' }}>
        Featured Posts
      </h3>
      <div className="row mb-2">
        {secondaryFeaturedPosts.map((post) => (
          <div key={post.id} className="col-md-6">
            <HomePostCard post={post} />
          </div>
        ))}
      </div>

      <h3 className="text-uppercase text-warning" style={{ letterSpacing: '2px' }}>
        Recent Articles
      </h3>
      <main role="main" className="container p-0">
        <div className="row">
          <div className="col-md-8 blog-main">
            {recentPosts.map((post) => (
              <HomePostCard key={post.id} post={post} />
            ))}
          </div>

          <aside className="col-md-4 blog-sidebar">
            <SidebarAbout about={siteMeta.about} />
            <SocialLinks links={siteMeta.social_links} />
          </aside>
        </div>
      </main>
    </main>
  )
}

export default HomePage
