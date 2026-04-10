import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { loginUser } from '../api/site'

function LoginPage() {
  const location = useLocation()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      const data = await loginUser(formData)
      const nextPath =
        data.user?.is_staff && location.state?.from
          ? location.state.from
          : data.user?.is_staff
            ? '/dashboard'
            : '/'
      window.location.assign(nextPath)
    } catch (requestError) {
      setError(requestError.data?.detail ?? 'Unable to log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h3 className="text-center">Login</h3>
      <form onSubmit={handleSubmit} style={{ width: '500px', margin: 'auto' }}>
        {error ? <div className="alert alert-danger">{error}</div> : null}
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
        <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  )
}

export default LoginPage
