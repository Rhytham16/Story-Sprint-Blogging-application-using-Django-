import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function SearchForm() {
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const navigate = useNavigate()

  useEffect(() => {
    setKeyword(searchParams.get('keyword') ?? '')
  }, [searchParams])

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedKeyword = keyword.trim()
    if (!trimmedKeyword) {
      navigate('/search')
      return
    }

    navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          className="form-control"
          type="text"
          name="keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Enter search term..."
          aria-label="Enter search term..."
          aria-describedby="button-search"
        />
        <button type="submit" className="btn btn-warning" id="button-search">
          Go!
        </button>
      </div>
    </form>
  )
}

export default SearchForm
