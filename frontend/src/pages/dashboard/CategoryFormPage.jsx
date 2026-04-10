import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCategory, getCategory, updateCategory } from '../../api/dashboard'

function CategoryFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadCategory = async () => {
      if (mode !== 'edit' || !id) {
        return
      }

      try {
        const data = await getCategory(id)
        if (isMounted) {
          setCategoryName(data.category_name ?? '')
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Unable to load category.')
        }
      }
    }

    loadCategory()

    return () => {
      isMounted = false
    }
  }, [id, mode])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const payload = { category_name: categoryName }
      if (mode === 'edit') {
        await updateCategory(id, payload)
      } else {
        await createCategory(payload)
      }
      navigate('/dashboard/categories')
    } catch (requestError) {
      const message = requestError.data?.category_name?.[0] ?? 'Unable to save category.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-3">
      <h2>{mode === 'edit' ? 'Edit Category' : 'Add New Category'}</h2>
      <form onSubmit={handleSubmit} style={{ width: '500px' }}>
        {error ? <div className="alert alert-warning">{error}</div> : null}
        <div className="form-group">
          <label htmlFor="category_name">Category name</label>
          <input
            id="category_name"
            name="category_name"
            className="form-control"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <br />
    </section>
  )
}

export default CategoryFormPage
