import { NavLink } from 'react-router-dom'

function Sidebar({ onLogout }) {
  return (
    <div className="col-md-3">
      <div className="nav flex-column nav-pills bg-light" aria-orientation="vertical">
        <NavLink end to="/dashboard" className="nav-link text-dark">
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/users" className="nav-link text-dark">
          Users
        </NavLink>
        <NavLink to="/dashboard/categories" className="nav-link text-dark">
          Categories
        </NavLink>
        <NavLink to="/dashboard/posts" className="nav-link text-dark">
          Posts
        </NavLink>
        <button
          type="button"
          className="nav-link text-dark btn btn-link text-left"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
