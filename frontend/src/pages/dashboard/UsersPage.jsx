import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { deleteUser, getUsers } from '../../api/dashboard'

function UsersPage() {
  const { currentUser } = useOutletContext()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      try {
        const data = await getUsers()
        if (isMounted) {
          setUsers(data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setUsers([])
          setError('Unable to load users.')
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      setUsers((current) => current.filter((user) => user.id !== id))
      setError('')
    } catch {
      setError('Unable to delete user.')
    }
  }

  return (
    <section className="py-3">
      <h2>All Users</h2>
      <Link to="/dashboard/users/add" className="btn btn-dark text-light float-right mb-2">
        Add User
      </Link>
      {error ? <div className="alert alert-warning">{error}</div> : null}
      <table className="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Full Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Active</th>
            <th>Staff</th>
            <th>Superuser</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{`${user.first_name} ${user.last_name}`.trim()}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_active ? <i className="fa fa-check text-success" /> : <i className="fa fa-times text-danger" />}</td>
              <td>{user.is_staff ? <i className="fa fa-check text-success" /> : <i className="fa fa-times text-danger" />}</td>
              <td>{user.is_superuser ? <i className="fa fa-check text-success" /> : <i className="fa fa-times text-danger" />}</td>
              <td>
                <Link to={`/dashboard/users/edit/${user.id}`}>
                  <i className="fa fa-edit text-success" />
                </Link>
                {currentUser?.id !== user.id ? (
                  <>
                    <span>&nbsp;</span>
                    <button
                      type="button"
                      className="btn btn-link p-0 border-0 align-baseline"
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="fa fa-trash text-danger" />
                    </button>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default UsersPage
