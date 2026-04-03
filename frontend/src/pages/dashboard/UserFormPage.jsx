import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createUser,
  getDashboardOptions,
  getUser,
  updateUser,
} from '../../api/dashboard'

function UserFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [options, setOptions] = useState({ groups: [], permissions: [] })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    groups: [],
    user_permissions: [],
  })

  useEffect(() => {
    let isMounted = true

    const loadFormData = async () => {
      try {
        const optionData = await getDashboardOptions()
        if (isMounted) {
          setOptions(optionData)
        }

        if (mode === 'edit' && id) {
          const user = await getUser(id)
          if (isMounted) {
            setFormData((current) => ({
              ...current,
              username: user.username ?? '',
              email: user.email ?? '',
              first_name: user.first_name ?? '',
              last_name: user.last_name ?? '',
              password: '',
              is_active: Boolean(user.is_active),
              is_staff: Boolean(user.is_staff),
              is_superuser: Boolean(user.is_superuser),
              groups: (user.groups ?? []).map(String),
              user_permissions: (user.user_permissions ?? []).map(String),
            }))
          }
        }

        if (isMounted) {
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Unable to load user form data.')
        }
      }
    }

    loadFormData()

    return () => {
      isMounted = false
    }
  }, [id, mode])

  const handleChange = (event) => {
    const { name, value, type, checked, options: selectOptions } = event.target
    setFormData((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : event.target.multiple
            ? Array.from(selectOptions).filter((option) => option.selected).map((option) => option.value)
            : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
        groups: formData.groups.map(Number),
        user_permissions: formData.user_permissions.map(Number),
      }

      if (formData.password) {
        payload.password = formData.password
      }

      if (mode === 'edit') {
        await updateUser(id, payload)
      } else {
        await createUser(payload)
      }

      navigate('/dashboard/users')
    } catch (requestError) {
      const errors = requestError.data ?? {}
      const firstMessage = Object.values(errors).flat?.()[0] ?? 'Unable to save user.'
      setError(firstMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-3">
      <h2>{mode === 'edit' ? 'Edit User' : 'Add New User'}</h2>
      <form onSubmit={handleSubmit}>
        {error ? <div className="alert alert-warning">{error}</div> : null}
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
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">
            Password {mode === 'edit' ? '(leave blank to keep current password)' : ''}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required={mode !== 'edit'}
          />
        </div>
        <div className="form-group form-check">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            className="form-check-input"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="is_active">
            Active
          </label>
        </div>
        <div className="form-group form-check">
          <input
            id="is_staff"
            name="is_staff"
            type="checkbox"
            className="form-check-input"
            checked={formData.is_staff}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="is_staff">
            Staff
          </label>
        </div>
        <div className="form-group form-check">
          <input
            id="is_superuser"
            name="is_superuser"
            type="checkbox"
            className="form-check-input"
            checked={formData.is_superuser}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="is_superuser">
            Superuser
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="groups">Groups</label>
          <select
            id="groups"
            name="groups"
            className="form-control"
            multiple
            value={formData.groups}
            onChange={handleChange}
          >
            {options.groups.map((group) => (
              <option key={group.id} value={String(group.id)}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="user_permissions">User permissions</label>
          <select
            id="user_permissions"
            name="user_permissions"
            className="form-control"
            multiple
            value={formData.user_permissions}
            onChange={handleChange}
          >
            {options.permissions.map((permission) => (
              <option key={permission.id} value={String(permission.id)}>
                {permission.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      <br />
    </section>
  )
}

export default UserFormPage
