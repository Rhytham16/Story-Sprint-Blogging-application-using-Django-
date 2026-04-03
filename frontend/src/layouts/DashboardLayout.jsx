import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'

function DashboardLayout() {
  const layoutContext = useOutletContext()
  const location = useLocation()

  if (!layoutContext?.isAuthResolved) {
    return <div className="py-4 text-muted">Checking access...</div>
  }

  if (!layoutContext?.currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!layoutContext.currentUser.is_staff) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-shell dashboard-shell">
      <div className="row">
        <Sidebar onLogout={layoutContext?.onLogout} />
        <div className="col-md-9">
          <Outlet context={layoutContext} />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
