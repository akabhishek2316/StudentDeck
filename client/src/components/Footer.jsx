import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h3>StudentDeck</h3>
          <p>
            The all-in-one hub for your campus &mdash; buy and sell,
            find lost items, share notes, and stay in the loop on
            everything happening around you.
          </p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/lost-found">Lost &amp; Found</Link>
          <Link to="/academic">Academic Resources</Link>
          <Link to="/events">Events</Link>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/profile">Profile</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/saved">Saved</Link>
        </div>

        <div className="footer-links">
          <h4>Project</h4>
          <span className="footer-static-text">Built for our campus community</span>
          <span className="footer-static-text">A student project</span>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {year} StudentDeck. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
