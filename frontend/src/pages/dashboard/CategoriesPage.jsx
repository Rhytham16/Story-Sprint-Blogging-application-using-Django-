import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, getCategories } from '../../api/dashboard'

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const data = await getCategories()
        if (isMounted) {
          setCategories(data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setCategories([])
          setError('Unable to load categories.')
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      setCategories((current) => current.filter((category) => category.id !== id))
      setError('')
    } catch {
      setError('Unable to delete category.')
    }
  }

  return (
    <section className="py-3">
      <h2>All Categories</h2>
      <Link to="/dashboard/categories/add" className="btn btn-dark text-light float-right mb-2">
        Add New
      </Link>
      {error ? <div className="alert alert-warning">{error}</div> : null}
      <table className="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Category Name</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={category.id}>
              <td>{index + 1}</td>
              <td>{category.category_name}</td>
              <td>{new Date(category.created_at).toLocaleString()}</td>
              <td>{new Date(category.updated_at).toLocaleString()}</td>
              <td>
                <Link to={`/dashboard/categories/edit/${category.id}`}>
                  <i className="fa fa-edit text-success" />
                </Link>
                <span>&nbsp;</span>
                <button
                  type="button"
                  className="btn btn-link p-0 border-0 align-baseline"
                  onClick={() => handleDelete(category.id)}
                >
                  <i className="fa fa-trash text-danger" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default CategoriesPage
