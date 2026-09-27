import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getEvent,
  getMe,
  deleteEvent,
} from '../api'
import BackButton from '../components/BackButton'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError('')

      const [eventData, userData] =
        await Promise.all([
          getEvent(id),
          getMe(),
        ])

      setEvent(eventData.event)
      setCurrentUser(userData.user)
    } catch (error) {
      console.error(
        'Failed to load event:',
        error
      )

      setError(
        error.message || 'Failed to load event'
      )
    } finally {
      setLoading(false)
    }
  }

  const isOwner =
    event &&
    currentUser &&
    String(event.createdBy?._id) ===
      String(currentUser._id)

  const formatDate = (value) => {
    if (!value) {
      return ''
    }

    return new Date(value).toLocaleDateString()
  }

  const openRegistration = () => {
    if (!event?.registrationLink) {
      alert('No registration link available')
      return
    }

    window.open(
      event.registrationLink,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this event?'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)

      await deleteEvent(id)

      alert('Event deleted successfully')

      navigate('/events')
    } catch (error) {
      console.error(
        'Failed to delete event:',
        error
      )

      alert(
        error.message ||
          'Failed to delete event'
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="event-details-not-found">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="event-details-not-found">

          <h1>Event Not Found</h1>

          <p>
            {error ||
              'This event is no longer available.'}
          </p>

          <Link to="/events">
            ← Back to Events
          </Link>

        </div>
      </div>
    )
  }

  return (
    <div className="event-details-page">

      <div className="event-details-container">

        <BackButton label="Back to Events" fallback="/events" />

        <div className="event-details-card">

          <div className="event-details-image">

            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
              />
            ) : (
              <span>📅</span>
            )}

          </div>

          <div className="event-details-content">

            <div className="event-details-title-row">

              <h1>{event.title}</h1>

              <span className="event-details-category">
                {event.category}
              </span>

            </div>

            <p className="event-details-description">
              {event.description}
            </p>

            <div className="event-details-information">

              <div className="event-information-item">

                <span>📅</span>

                <div>
                  <small>Date</small>

                  <p>
                    {formatDate(event.date)}
                  </p>
                </div>

              </div>

              <div className="event-information-item">

                <span>🕐</span>

                <div>
                  <small>Time</small>

                  <p>
                    {event.startTime}

                    {event.endTime
                      ? ` - ${event.endTime}`
                      : ''}
                  </p>
                </div>

              </div>

              <div className="event-information-item">

                <span>📍</span>

                <div>
                  <small>Location</small>

                  <p>
                    {event.location}
                  </p>
                </div>

              </div>

              <div className="event-information-item">

                <span>👤</span>

                <div>
                  <small>Organizer</small>

                  <p>
                    {event.organizer}
                  </p>
                </div>

              </div>

            </div>

            <div className="event-created-by">

              <h2>Created By</h2>

              <p>
                {event.createdBy?.name ||
                  'Unknown user'}
              </p>

              {event.createdBy?.email && (
                <p>
                  {event.createdBy.email}
                </p>
              )}

            </div>

            <div className="event-details-actions">

              <div className="event-action-buttons">

                {event.registrationLink && (
                  <button
                    type="button"
                    className="event-registration-button"
                    onClick={openRegistration}
                  >
                    Register for Event
                  </button>
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/events/${id}/edit`}
                      className="event-edit-button"
                    >
                      Edit Event
                    </Link>

                    <button
                      type="button"
                      className="event-delete-button"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting
                        ? 'Deleting...'
                        : 'Delete Event'}
                    </button>
                  </>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default EventDetails