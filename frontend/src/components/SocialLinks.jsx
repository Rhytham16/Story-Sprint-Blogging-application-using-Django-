function SocialLinks({ links = [] }) {
  if (!links.length) {
    return null
  }

  return (
    <div className="p-3">
      <h4 className="font-italic">Follow Us</h4>
      <ol className="list-unstyled">
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.link} target="_blank" rel="noreferrer">
              {link.platform}
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default SocialLinks
