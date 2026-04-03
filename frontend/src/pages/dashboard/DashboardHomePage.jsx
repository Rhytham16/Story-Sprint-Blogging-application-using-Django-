import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getDashboardSummary } from '../../api/dashboard'

function DashboardHomePage() {
  const { currentUser } = useOutletContext()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadSummary = async () => {
      try {
        const data = await getDashboardSummary()
        if (isMounted) {
          setSummary(data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setSummary(null)
          setError('Unable to load dashboard summary.')
        }
      }
    }

    loadSummary()

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
    </section>
  )
}

export default DashboardHomePage
