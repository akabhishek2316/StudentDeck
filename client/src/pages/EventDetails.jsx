import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import {
  getEvent,
  getMe,
  deleteEvent,
} from '../api'

import BackButton from '../components/BackButton'
import UnauthorizedAccess from '../components/UnauthorizedAccess'

import './EventDetails.css'


function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    loadEvent()
  }, [id])


  const loadEvent = async () => {
    try {
      setLoading(true)
      setError('')

      /*
       * First check whether user is logged in
       */
      let userData

      try {
        userData = await getMe()
      } catch (authError) {
        console.log(
          'User is not logged in'
        )

        setAuthorized(false)
        setCurrentUser(null)
        setEvent(null)

        return
      }

      if (!userData?.user) {
        setAuthorized(false)
        setCurrentUser(null)
        setEvent(null)

        return
      }

      /*
       * User is authenticated
       */
      setAuthorized(true)
      setCurrentUser(userData.user)


      /*
       * Now load event
       */
      const eventData =
        await getEvent(id)

      setEvent(eventData.event)

    } catch (error) {
      console.error(
        'Failed to load event:',
        error
      )

      setError(
        error.message ||
          'Failed to load event'
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

    return new Date(
      value
    ).toLocaleDateString()
  }


  const formatTime = (value) => {
    if (!value) {
      return ''
    }

    const [hours, minutes] =
      value.split(':')

    const hour = Number(hours)

    const period =
      hour >= 12
        ? 'PM'
        : 'AM'

    const hour12 =
      hour % 12 || 12

    return `${hour12}:${minutes} ${period}`
  }


  const openRegistration = () => {
    if (!event?.registrationLink) {
      alert(
        'No registration link available'
      )

      return
    }

    window.open(
      event.registrationLink,
      '_blank',
      'noopener,noreferrer'
    )
  }


  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this event?'
      )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)

      await deleteEvent(id)

      alert(
        'Event deleted successfully'
      )

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


  /*
   * Login required
   */
  if (authorized === false) {
    return (
      <UnauthorizedAccess
        title="Login Required"
        message="You need to login to view event details."
        buttonText="Go to Login"
      />
    )
  }


  /*
   * Loading
   */
  if (
    loading ||
    authorized === null
  ) {
    return (
      <div className="event-details-page">

        <div className="event-details-not-found">

          <h1>
            Loading...
          </h1>

        </div>

      </div>
    )
  }


  /*
   * Event not found / API error
   */
  if (
    error ||
    !event
  ) {
    return (
      <div className="event-details-page">

        <div className="event-details-not-found">

          <h1>
            Event Not Found
          </h1>

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

        <BackButton
          label="Back to Events"
          fallback="/events"
        />


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

              <h1>
                {event.title}
              </h1>

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

                  <small>
                    Date
                  </small>

                  <p>
                    {formatDate(
                      event.date
                    )}
                  </p>

                </div>

              </div>


              <div className="event-information-item">

                <span>🕐</span>

                <div>

                  <small>
                    Time
                  </small>

                  <p>
                    {formatTime(
                      event.startTime
                    )}

                    {event.endTime
                      ? ` - ${formatTime(
                          event.endTime
                        )}`
                      : ''}
                  </p>

                </div>

              </div>


              <div className="event-information-item">

                <span>📍</span>

                <div>

                  <small>
                    Location
                  </small>

                  <p>
                    {event.location}
                  </p>

                </div>

              </div>


              <div className="event-information-item">

                <span>👤</span>

                <div>

                  <small>
                    Organizer
                  </small>

                  <p>
                    {event.organizer}
                  </p>

                </div>

              </div>


            </div>


            <div className="event-created-by">

              <h2>
                Created By
              </h2>

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
                    onClick={
                      openRegistration
                    }
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
                      onClick={
                        handleDelete
                      }
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