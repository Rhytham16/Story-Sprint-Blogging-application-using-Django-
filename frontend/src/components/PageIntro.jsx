function PageIntro({ title, description }) {
  return (
    <div className="migration-note p-4 mb-4">
      <h2 className="h4 mb-2">{title}</h2>
      <p className="mb-0 text-muted">{description}</p>
    </div>
  )
}

export default PageIntro
