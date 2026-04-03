import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/site'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await registerUser(formData)
      navigate('/login')
    } catch (requestError) {
      const errors = requestError.data
      if (typeof errors === 'object' && errors !== null) {
        const firstMessage = Object.values(errors).flat()[0]
        setError(firstMessage ?? 'Unable to register.')
      } else {
        setError('Unable to register.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h3 className="text-center">Register</h3>
      <form onSubmit={handleSubmit} style={{ width: '500px', margin: 'auto' }}>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password2">Confirm password</label>
          <input
            id="password2"
            name="password2"
            type="password"
            className="form-control"
            value={formData.password2}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </main>
  )
}

export default RegisterPage
