import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import './Home.css'

const sections = [
  {
    id: 'section-marketplace',
    icon: '🛒',
    eyebrow: 'BUY • SELL',
    title: 'Marketplace',
    description:
      'Buy and sell useful items within your campus community.',
    link: '/marketplace',
    action: 'Explore Marketplace',
  },
  {
    id: 'section-lost-found',
    icon: '🔎',
    eyebrow: 'FIND • RETURN',
    title: 'Lost & Found',
    description:
      'Report lost belongings and help fellow students find what they have misplaced.',
    link: '/lost-found',
    action: 'Explore Lost & Found',
  },
  {
    id: 'section-academic',
    icon: '📚',
    eyebrow: 'LEARN • GROW',
    title: 'Academic Resources',
    description:
      'Access notes, previous year papers and useful study materials in one place.',
    link: '/academic',
    action: 'Explore Resources',
  },
  {
    id: 'section-events',
    icon: '📅',
    eyebrow: 'DISCOVER • PARTICIPATE',
    title: 'Campus Events',
    description:
      'Discover events, activities and opportunities happening around your campus.',
    link: '/events',
    action: 'Explore Events',
  },
  {
    id: 'section-messages',
    icon: '💬',
    eyebrow: 'CONNECT • CHAT',
    title: 'Messaging',
    description:
      'Connect and communicate with fellow students through your campus community.',
    link: '/messages',
    action: 'Open Messages',
  },
  {
    id: 'section-profile',
    icon: '👤',
    eyebrow: 'YOUR • IDENTITY',
    title: 'Student Profile',
    description:
      'Create and manage your StudentDeck profile and campus identity.',
    link: '/profile',
    action: 'View Profile',
  },
]

function Home() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const targetId = location.state?.scrollTo

    if (!targetId) return

    const el = document.getElementById(targetId)

    if (el) {
      setTimeout(() => {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        el.classList.add('feature-card-highlight')

        const timeout = setTimeout(() => {
          el.classList.remove('feature-card-highlight')
        }, 1600)

        return () => clearTimeout(timeout)
      }, 100)
    }

    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [
    location.state,
    location.pathname,
    navigate,
  ])

  return (
    <div className="home">

      {/* =================================================
          HERO
          ================================================= */}

      <section className="home-hero">

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Built for Students • Made for Campus Life
          </div>

          <h1>
            YOUR CAMPUS.
            <br />
            <span>ONE SMARTER PLACE.</span>
          </h1>

          <p className="hero-description">
            StudentDeck brings your campus essentials
            together — from buying and selling to finding
            lost items, discovering events, accessing
            academic resources, and connecting with students.
          </p>

          <div className="hero-actions">

            <Link
              to="/marketplace"
              className="hero-primary-button"
            >
              Explore Campus
              <span>→</span>
            </Link>

            <Link
              to="/profile"
              className="hero-secondary-button"
            >
              Get Started
            </Link>

          </div>

          <div className="hero-trust">

            <span>✓ Campus Community</span>
            <span>✓ Student Focused</span>
            <span>✓ All in One Place</span>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div className="dashboard-window">

            <div className="dashboard-top">

              <div className="dashboard-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span className="dashboard-title">
                StudentDeck
              </span>

              <span className="dashboard-status">
                ● Live
              </span>

            </div>


            <div className="dashboard-heading">
              <span>Campus Hub</span>
              <small>Everything connected</small>
            </div>


            <div className="dashboard-grid">

              <div className="dashboard-card">
                <span>🛒</span>
                <div>
                  <strong>Marketplace</strong>
                  <small>Buy & Sell</small>
                </div>
              </div>

              <div className="dashboard-card">
                <span>🔎</span>
                <div>
                  <strong>Lost & Found</strong>
                  <small>Find Items</small>
                </div>
              </div>

              <div className="dashboard-card">
                <span>📚</span>
                <div>
                  <strong>Academics</strong>
                  <small>Study Resources</small>
                </div>
              </div>

              <div className="dashboard-card">
                <span>📅</span>
                <div>
                  <strong>Events</strong>
                  <small>Campus Life</small>
                </div>
              </div>

            </div>


            <div className="dashboard-message">

              <div className="message-avatar">
                S
              </div>

              <div>
                <strong>Stay connected</strong>
                <small>
                  Your campus, your community.
                </small>
              </div>

              <span className="message-arrow">
                →
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          STATS
          ================================================= */}

      <section className="platform-stats">

        <div className="stat-item">
          <strong>06</strong>
          <span>Core Services</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>01</strong>
          <span>Campus Platform</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>∞</strong>
          <span>Ways to Connect</span>
        </div>

      </section>


      {/* =================================================
          FEATURES
          ================================================= */}

      <section className="features-section">

        <div className="section-heading">

          <span className="section-label">
            CAMPUS ESSENTIALS
          </span>

          <h2>
            Everything Campus,
            <span> Connected.</span>
          </h2>

          <p>
            One platform designed to make everyday
            student life simpler, more connected,
            and more useful.
          </p>

        </div>


        <div className="feature-grid">

          {sections.map((section) => (

            <div
              id={section.id}
              key={section.id}
              className="feature-wrapper"
            >

              <Link
                to={section.link}
                className="feature-card"
              >

                <div className="feature-card-top">

                  <div className="feature-icon">
                    {section.icon}
                  </div>

                  <span className="feature-arrow">
                    ↗
                  </span>

                </div>


                <div className="feature-card-content">

                  <span className="feature-eyebrow">
                    {section.eyebrow}
                  </span>

                  <h3>
                    {section.title}
                  </h3>

                  <p>
                    {section.description}
                  </p>

                </div>


                <div className="feature-card-footer">

                  <span>
                    {section.action}
                  </span>

                  <span>
                    →
                  </span>

                </div>

              </Link>

            </div>

          ))}

        </div>

      </section>


      {/* =================================================
          FINAL CTA
          ================================================= */}

      <section className="home-cta">

        <div className="cta-glow"></div>

        <div className="cta-content">

          <span className="section-label">
            YOUR CAMPUS. YOUR COMMUNITY.
          </span>

          <h2>
            Make campus life
            <span> more connected.</span>
          </h2>

          <p>
            Discover resources, connect with students,
            participate in campus life and make the most
            of your student experience.
          </p>

          <div className="cta-actions">

            <Link
              to="/marketplace"
              className="cta-primary"
            >
              Explore StudentDeck
              <span>→</span>
            </Link>

          </div>

        </div>

      </section>

    </div>
  )
}

export default Home