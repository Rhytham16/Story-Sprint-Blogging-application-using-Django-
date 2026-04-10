import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createPost,
  getCategories,
  getDashboardPost,
  updatePost,
} from '../../api/dashboard'

function PostFormPage({ mode }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    short_description: '',
    blog_body: '',
    status: 'Draft',
    is_featured: false,
    featured_image: null,
  })

  useEffect(() => {
    let isMounted = true

    const loadFormData = async () => {
      try {
        const categoryData = await getCategories()
        if (isMounted) {
          setCategories(categoryData)
        }

        if (mode === 'edit' && slug) {
          const post = await getDashboardPost(slug)
          if (isMounted) {
            setFormData((current) => ({
              ...current,
              title: post.title ?? '',
              category: String(post.category ?? ''),
              short_description: post.short_description ?? '',
              blog_body: post.blog_body ?? '',
              status: post.status ?? 'Draft',
              is_featured: Boolean(post.is_featured),
              featured_image: null,
            }))
          }
        }

        if (isMounted) {
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Unable to load post form data.')
        }
      }
    }

    loadFormData()

    return () => {
      isMounted = false
    }
  }, [mode, slug])

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target
    setFormData((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'file'
            ? files?.[0] ?? null
            : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('category', formData.category)
      payload.append('short_description', formData.short_description)
      payload.append('blog_body', formData.blog_body)
      payload.append('status', formData.status)
      payload.append('is_featured', formData.is_featured)
      if (formData.featured_image) {
        payload.append('featured_image', formData.featured_image)
      }

      if (mode === 'edit') {
        await updatePost(slug, payload)
      } else {
        await createPost(payload)
      }

      navigate('/dashboard/posts')
    } catch (requestError) {
      const errors = requestError.data ?? {}
      const firstMessage = Object.values(errors).flat?.()[0] ?? 'Unable to save post.'
      setError(firstMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-3">
      <h2>{mode === 'edit' ? 'Edit Blog Post' : 'Add New Post'}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {error ? <div className="alert alert-warning">{error}</div> : null}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="featured_image">Featured image</label>
          <input
            id="featured_image"
            name="featured_image"
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
            required={mode !== 'edit'}
          />
        </div>
        <div className="form-group">
          <label htmlFor="short_description">Short description</label>
          <textarea
            id="short_description"
            name="short_description"
            className="form-control"
            value={formData.short_description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="blog_body">Blog body</label>
          <textarea
            id="blog_body"
            name="blog_body"
            className="form-control"
            value={formData.blog_body}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>
        <div className="form-group form-check">
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            className="form-check-input"
            checked={formData.is_featured}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="is_featured">
            Featured post
          </label>
        </div>
        <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <br />
    </section>
  )
}

export default PostFormPage
