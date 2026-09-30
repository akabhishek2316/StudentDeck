import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getLostFoundPost,
  getMe,
  deleteLostFoundPost,
} from '../api'
import './LostFoundDetails.css'
import UnauthorizedAccess from '../components/UnauthorizedAccess'

function LostFoundDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    loadPost()
  }, [id])

  const loadPost = async () => {
    try {
      setLoading(true)
      setError('')
      setUnauthorized(false)

      const token = localStorage.getItem('token')

      if (!token) {
        setUnauthorized(true)
        return
      }

      const [postData, userData] = await Promise.all([
        getLostFoundPost(id),
        getMe(),
      ])

      setItem(postData.post)
      setCurrentUser(userData.user)

    } catch (error) {
      console.error(
        'Failed to load Lost & Found post:',
        error
      )

      const message =
        error.message?.toLowerCase() || ''

      if (
        message.includes('unauthorized') ||
        message.includes('not authorized') ||
        message.includes('invalid token') ||
        message.includes('token')
      ) {
        setUnauthorized(true)
        return
      }

      setError(
        error.message ||
        'Failed to load Lost & Found post'
      )
    } finally {
      setLoading(false)
    }
  }

  const isOwner =
    item &&
    currentUser &&
    String(item.user?._id) ===
    String(currentUser._id)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this Lost & Found post?'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)

      await deleteLostFoundPost(id)

      alert(
        'Lost & Found post deleted successfully'
      )

      navigate('/lost-found')
    } catch (error) {
      console.error(
        'Failed to delete Lost & Found post:',
        error
      )

      alert(
        error.message ||
        'Failed to delete Lost & Found post'
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="lost-found-details-page">

        <div className="lost-found-details-state">

          <div className="lost-found-loading-spinner"></div>

          <span className="lost-found-state-label">
            LOST & FOUND
          </span>

          <h1>
            Loading item...
          </h1>

          <p>
            Fetching the item details for you.
          </p>

        </div>

      </div>
    )
  }

  if (unauthorized) {
    return (
      <UnauthorizedAccess
        title="Login Required"
        message="You need to login to view Lost & Found item details."
        buttonText="Login to Continue"
      />
    )
  }

  if (error || !item) {
    return (
      <div className="lost-found-details-page">

        <div className="lost-found-details-state">

          <div className="lost-found-state-icon">
            !
          </div>

          <span className="lost-found-state-label">
            LOST & FOUND
          </span>

          <h1>
            Item Not Found
          </h1>

          <p>
            {error ||
              'This Lost & Found post is no longer available.'}
          </p>

          <Link
            to="/lost-found"
            className="lost-found-back-link"
          >
            ← Back to Lost & Found
          </Link>

        </div>

      </div>
    )
  }

  const isLost = item.type === 'lost'

  return (
    <div className="lost-found-details-page">

      <div className="lost-found-details-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <section className="lost-found-details-header">

          <Link
            to="/lost-found"
            className="lost-found-back-button"
          >
            <span>←</span>
            <span>Back</span>
          </Link>


          <div className="lost-found-header-content">

            <div className="lost-found-header-label">
              <span className="lost-found-header-dot"></span>
              LOST & FOUND
            </div>


            <div className="lost-found-header-title">

              <h1>
                {item.title}
              </h1>

              <span
                className={
                  isLost
                    ? 'details-status lost'
                    : 'details-status found'
                }
              >
                <span className="status-dot"></span>
                {isLost ? 'Lost' : 'Found'}
              </span>

            </div>

            <p>
              {item.description}
            </p>

          </div>




        </section>





        {/* =================================================
            MAIN DETAIL CARD
            ================================================= */}

        <section className="lost-found-details-card">

          {/* IMAGE */}

          <div className="lost-found-details-image">

            {item.image ? (

              <>
                <div className="lost-found-image-badge">
                  {isLost ? 'Lost Item' : 'Found Item'}
                </div>

                <img
                  src={item.image}
                  alt={item.title}
                />
              </>

            ) : (

              <div className="lost-found-no-image">

                <div className="lost-found-no-image-icon">
                  📷
                </div>

                <span>
                  No image available
                </span>

              </div>

            )}

          </div>


          {/* DETAILS */}

          <div className="lost-found-details-content">

            <div className="details-content-heading">

              <span>
                ITEM INFORMATION
              </span>

              <h2>
                About this item
              </h2>

            </div>


            {/* INFORMATION GRID */}

            <div className="lost-found-information">

              <div className="lost-found-information-item">

                <div className="information-icon">
                  🏷️
                </div>

                <div>
                  <small>
                    Category
                  </small>

                  <p>
                    {item.category || 'Not specified'}
                  </p>
                </div>

              </div>


              <div className="lost-found-information-item">

                <div className="information-icon">
                  📍
                </div>

                <div>
                  <small>
                    Location
                  </small>

                  <p>
                    {item.location || 'Not specified'}
                  </p>
                </div>

              </div>


              <div className="lost-found-information-item">

                <div className="information-icon">
                  📅
                </div>

                <div>
                  <small>
                    Date
                  </small>

                  <p>
                    {new Date(
                      item.date
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>


              <div className="lost-found-information-item">

                <div className="information-icon">
                  📞
                </div>

                <div>
                  <small>
                    Contact
                  </small>

                  <p>
                    {item.contactInfo ||
                      'Not provided'}
                  </p>
                </div>

              </div>

            </div>


            {/* REPORTED BY */}

            <div className="lost-found-reported-by">

              <div className="reported-user-avatar">
                {item.user?.name
                  ? item.user.name
                    .charAt(0)
                    .toUpperCase()
                  : 'U'}
              </div>

              <div className="reported-user-info">

                <span>
                  REPORTED BY
                </span>

                <h3>
                  {item.user?.name ||
                    'Unknown user'}
                </h3>

                {item.user?.email && (
                  <p>
                    {item.user.email}
                  </p>
                )}

              </div>

            </div>


            {/* OWNER ACTIONS */}

            {isOwner && (

              <div className="lost-found-owner-actions">

                <Link
                  to={`/lost-found/${id}/edit`}
                  className="lost-found-edit-button"
                >
                  Edit Post
                </Link>

                <button
                  type="button"
                  className="lost-found-delete-button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? 'Deleting...'
                    : 'Delete Post'}
                </button>

              </div>

            )}

          </div>

        </section>

      </div>

    </div>
  )
}

export default LostFoundDetails