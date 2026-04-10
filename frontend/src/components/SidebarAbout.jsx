function SidebarAbout({ about }) {
  if (!about) {
    return null
  }

  return (
    <div className="p-3 mb-3 bg-light rounded">
      <h4 className="font-italic">{about.about_heading}</h4>
      <p className="mb-0">{about.about_description}</p>
    </div>
  )
}

export default SidebarAbout
