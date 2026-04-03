import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import CategoryNav from '../components/CategoryNav'
import { clearStoredAuth } from '../api/auth'
import { getCurrentUser, getSiteMeta, logoutUser } from '../api/site'

function MainLayout() {
  const [isAuthResolved, setIsAuthResolved] = useState(false)
  const [siteMeta, setSiteMeta] = useState({
    about: null,
    categories: [],
    social_links: [],
  })
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadLayoutData = async () => {
      try {
        const site = await getSiteMeta()
        if (isMounted) {
          setSiteMeta(site)
        }
      } catch {
        if (isMounted) {
          setSiteMeta({ about: null, categories: [], social_links: [] })
        }
      }

      try {
        const user = await getCurrentUser()
        if (isMounted) {
          setCurrentUser(user.authenticated ? user.user : null)
        }
      } catch (error) {
        if (isMounted && (error.status === 401 || error.status === 403)) {
          clearStoredAuth()
          setCurrentUser(null)
        }
      } finally {
        if (isMounted) {
          setIsAuthResolved(true)
        }
      }
    }

    loadLayoutData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Ignore logout API errors and clear local state either way.
    }

    setCurrentUser(null)
    window.location.assign('/')
  }

  return (
    <div className="app-shell">
      <div className="container">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <CategoryNav categories={siteMeta.categories} />
        <Outlet
          context={{
            currentUser,
            isAuthResolved,
            siteMeta,
            onLogout: handleLogout,
          }}
        />
      </div>
    </div>
  )
}

export default MainLayout
