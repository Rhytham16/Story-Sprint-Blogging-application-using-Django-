import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getCategoryStats, getDashboardSummary, getUserStats } from '../../api/dashboard'

function DashboardHomePage() {
  const { currentUser } = useOutletContext()
  const [summary, setSummary] = useState(null)
  const [categoryStats, setCategoryStats] = useState([])
  const [userStats, setUserStats] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const [summaryData, categoryData, userData] = await Promise.all([
          getDashboardSummary(),
          getCategoryStats(),
          getUserStats(),
        ])

        if (isMounted) {
          setSummary(summaryData)
          setCategoryStats(categoryData)
          setUserStats(userData)
          setError('')
        }
      } catch {
        if (isMounted) {
          setSummary(null)
          setCategoryStats([])
          setUserStats([])
          setError('Unable to load dashboard analytics.')
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="py-3">
      <span>
        Logged in as <b>{currentUser?.username ?? 'User'}</b>
      </span>
      {error ? <div className="alert alert-warning mt-3">{error}</div> : null}

      <div className="row mt-3">
        <div className="col">
          <div className="card border-default mb-3">
            <div className="card-header text-center text-uppercase font-weight-bold">
              All Categories
            </div>
            <div className="card-body text-dark">
              <h5 className="card-title text-center">{summary?.category_count ?? '-'}</h5>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-default mb-3">
            <div className="card-header text-center text-uppercase font-weight-bold">
              All Posts
            </div>
            <div className="card-body text-dark">
              <h5 className="card-title text-center">{summary?.blogs_count ?? '-'}</h5>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-default mb-3">
            <div className="card-header text-center text-uppercase font-weight-bold">
              Published Posts
            </div>
            <div className="card-body text-dark">
              <h5 className="card-title text-center">
                {summary?.published_blogs_count ?? '-'}
              </h5>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-6 mb-4">
          <div className="card border-default h-100">
            <div className="card-header text-uppercase font-weight-bold">
              Category Analytics
            </div>
            <div className="card-body">
              {categoryStats.length ? (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total</th>
                        <th>Published</th>
                        <th>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryStats.map((category) => (
                        <tr key={category.id}>
                          <td>{category.category_name}</td>
                          <td>{category.total_posts}</td>
                          <td>{category.published_posts}</td>
                          <td>{category.total_comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No category analytics available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card border-default h-100">
            <div className="card-header text-uppercase font-weight-bold">
              Author Analytics
            </div>
            <div className="card-body">
              {userStats.length ? (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Total Posts</th>
                        <th>Published</th>
                        <th>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userStats.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.total_posts}</td>
                          <td>{user.published_posts}</td>
                          <td>{user.comments_received}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No user analytics available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardHomePage
