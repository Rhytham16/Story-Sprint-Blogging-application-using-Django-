import { Link } from 'react-router-dom'
import SearchForm from './SearchForm'

function Header({ currentUser, onLogout }) {
  return (
    <header className="blog-header py-3">
      <div className="row flex-nowrap justify-content-between align-items-center">
        <div className="col-4 pt-1">
          <Link className="blog-header-logo text-dark" to="/">
            Django Blog
          </Link>
        </div>
        <div className="col-4">
          <SearchForm />
        </div>
        <div className="col-4 d-flex justify-content-end align-items-center">
          {!currentUser ? (
            <>
              <Link className="btn btn-sm btn-warning" to="/login">
                Login
              </Link>
              <span className="mx-2" />
              <Link className="btn btn-sm btn-outline-secondary" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              {currentUser?.is_staff ? (
                <>
                  <span>
                    <Link to="/dashboard">Dashboard</Link>
                  </span>
                  <span className="mx-3" />
                </>
              ) : null}
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
