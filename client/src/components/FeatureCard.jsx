import { Link } from 'react-router-dom'

function FeatureCard({ title, description, link }) {
  return (
    <Link to={link} className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="feature-card-cta">
        Explore {title}
        <span className="feature-card-cta-arrow">→</span>
      </span>
    </Link>
  )
}

export default FeatureCard