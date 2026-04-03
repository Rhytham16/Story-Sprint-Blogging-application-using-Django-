import { NavLink } from 'react-router-dom'

function CategoryNav({ categories = [] }) {
  return (
    <div className="nav-scroller py-1 mb-2">
      <nav className="nav d-flex justify-content-between">
        {categories.map((category) => (
          <NavLink
            key={category.id}
            className="p-2 text-muted"
            to={`/category/${category.id}`}
          >
            {category.category_name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default CategoryNav
