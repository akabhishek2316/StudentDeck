import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getEvents,
  createEvent,
  uploadToCloudinary,
} from '../api'
import './Events.css'
import PageHeader from '../components/PageHeader'

function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] =
    useState('All')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadEvents()
  }, [])



  const formatTime = (value) => {
    if (!value) {
      return ''
    }

    const [hours, minutes] = value.split(':')
    const hour = Number(hours)

    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12

    return `${hour12}:${minutes} ${period}`
  }

  const formatDate = (value) => {
    if (!value) {
      return ''
    }

    return new Date(value).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getEvents()

      setEvents(data.events || [])
    } catch (error) {
      console.error(
        'Failed to load events:',
        error
      )

      setError(
        error.message ||
        'Failed to load events'
      )
    } finally {
      setLoading(false)
    }
  }



  const filteredEvents =
    events.filter((event) => {
      const searchText =
        search.toLowerCase()

      const matchesSearch =
        (event.title || '')
          .toLowerCase()
          .includes(searchText) ||
        (event.description || '')
          .toLowerCase()
          .includes(searchText) ||
        (event.location || '')
          .toLowerCase()
          .includes(searchText) ||
        (event.organizer || '')
          .toLowerCase()
          .includes(searchText)

      const matchesCategory =
        categoryFilter === 'All' ||
        event.category === categoryFilter

      return (
        matchesSearch &&
        matchesCategory
      )
    })

  return (
    <div className="events-page">

      <PageHeader
        eyebrow="Campus Activities"
        title="Campus Events"
        description="Discover and share events happening around campus."
        backTo="/"
        backText="Back"
        actionTo="/events/create"
        actionText="Add Event"
        actionIcon="+"
      />



      <section className="events-content">

        <div className="events-toolbar">

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Categories
            </option>

            <option value="Technical">
              Technical
            </option>

            <option value="Cultural">
              Cultural
            </option>

            <option value="Sports">
              Sports
            </option>

            <option value="Academic">
              Academic
            </option>

            <option value="Workshop">
              Workshop
            </option>

            <option value="Other">
              Other
            </option>
          </select>

        </div>

        <h2>Upcoming Events</h2>

        {loading ? (
          <div className="no-events">
            <h3>Loading events...</h3>
          </div>
        ) : error ? (
          <div className="no-events">
            <h3>Unable to load events</h3>
            <p>{error}</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">

            {filteredEvents.map((event) => (

              <div
                className="event-card"
                key={event._id}
              >

                <div className="event-image">

                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                    />
                  ) : (
                    <span>📅</span>
                  )}

                </div>

                <div className="event-details">

                  <div className="event-title-row">

                    <h3>
                      {event.title}
                    </h3>

                    <span className="event-category">
                      {event.category}
                    </span>

                  </div>

                  <p className="event-description">
                    {event.description}
                  </p>

                  <div className="event-info">

                    <span>
                      📅 {formatDate(event.date)}
                    </span>

                    <span>
                      🕐 {formatTime(event.startTime)}
                      {event.endTime
                        ? ` - ${formatTime(event.endTime)}`
                        : ''}
                    </span>

                    <span>
                      📍 {event.location}
                    </span>

                    <span>
                      👤 {event.organizer}
                    </span>

                  </div>

                  <div className="event-card-actions">

                    <Link
                      to={`/events/${event._id}`}
                      className="event-view-details-button"
                    >
                      View Details
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>
        ) : (
          <div className="no-events">
            <h3>No events found</h3>

            <p>
              Try changing your search or category.
            </p>
          </div>
        )}

      </section>

    </div>
  )
}

export default Events