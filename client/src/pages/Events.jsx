import { Link ,useNavigate} from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getEvents,
  createEvent,
  uploadToCloudinary,
} from '../api'
import './Events.css'

function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] =
    useState('All')
  const [showForm, setShowForm] =
    useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] =
    useState('')
  const [organizer, setOrganizer] =
    useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] =
    useState('')
  const [endTime, setEndTime] =
    useState('')
  const [location, setLocation] =
    useState('')
  const [category, setCategory] =
    useState('')

  const [imageFile, setImageFile] =
    useState(null)
  const [imagePreview, setImagePreview] =
    useState('')

  const [registrationLink, setRegistrationLink] =
    useState('')

  const [loading, setLoading] =
    useState(true)
  const [submitting, setSubmitting] =
    useState(false)
  const [uploadingImage, setUploadingImage] =
    useState(false)
  const [error, setError] =
    useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

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

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Please select a JPG, PNG, or WEBP image'
      )
      event.target.value = ''
      return
    }

    const maxSize =
      10 * 1024 * 1024

    if (file.size > maxSize) {
      alert(
        'Image size must be 10 MB or less'
      )
      event.target.value = ''
      return
    }

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)

    setImagePreview(
      URL.createObjectURL(file)
    )
  }

  const handleRemoveImage = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(null)
    setImagePreview('')
  }

  const resetForm = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setTitle('')
    setDescription('')
    setOrganizer('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setLocation('')
    setCategory('')
    setImageFile(null)
    setImagePreview('')
    setRegistrationLink('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      alert('Please enter an event title')
      return
    }

    if (!description.trim()) {
      alert(
        'Please enter an event description'
      )
      return
    }

    if (!organizer.trim()) {
      alert(
        'Please enter the organizer name'
      )
      return
    }

    if (!date) {
      alert('Please select an event date')
      return
    }

    if (!startTime) {
      alert('Please select the start time')
      return
    }

    if (!location.trim()) {
      alert(
        'Please enter the event location'
      )
      return
    }

    if (!category) {
      alert(
        'Please select the event category'
      )
      return
    }

    try {
      setSubmitting(true)

      let image = ''
      let imagePublicId = ''

      if (imageFile) {
        setUploadingImage(true)

        const uploadResult =
          await uploadToCloudinary(
            imageFile
          )

        image =
          uploadResult.secureUrl

        imagePublicId =
          uploadResult.publicId

        setUploadingImage(false)
      }

      await createEvent({
        title: title.trim(),
        description:
          description.trim(),
        organizer:
          organizer.trim(),
        date,
        startTime,
        endTime,
        location:
          location.trim(),
        category:
          category.trim(),
        image,
        imagePublicId,
        registrationLink:
          registrationLink.trim(),
      })

      alert(
        'Event added successfully!'
      )

      resetForm()
      setShowForm(false)

      await loadEvents()
    } catch (error) {
      console.error(
        'Create event error:',
        error
      )

      alert(
        error.message ||
          'Failed to create event'
      )
    } finally {
      setUploadingImage(false)
      setSubmitting(false)
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

   <section className="events-header">

  <div className="events-header-inner">

    {/* LEFT — BACK */}
    <button
      type="button"
      className="events-back-button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1)
        } else {
          navigate('/')
        }
      }}
    >
      ← <span>Back</span>
    </button>


    {/* CENTER — TITLE */}
    <div className="events-header-center">

      <span className="events-eyebrow">
        CAMPUS ACTIVITIES
      </span>

      <h1>
        Campus Events
      </h1>

      <p>
        Discover and share events happening around campus.
      </p>

    </div>


    {/* RIGHT — ADD EVENT */}
    <button
      type="button"
      className="add-event-button"
      onClick={() =>
        setShowForm((current) => !current)
      }
    >
      {showForm
        ? 'Close Form'
        : 'Add Event'}
    </button>

  </div>

</section>

      {showForm && (
        <section className="event-form-section">

          <div className="event-form-container">

            <h2>Add Campus Event</h2>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Event Title</label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Example: Coding Contest"
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the event..."
                />
              </div>

              <div className="form-group">
                <label>Organizer</label>

                <input
                  type="text"
                  value={organizer}
                  onChange={(event) =>
                    setOrganizer(
                      event.target.value
                    )
                  }
                  placeholder="Example: Coding Club"
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select category
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

              <div className="event-date-time">

                <div className="form-group">
                  <label>Date</label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Start Time</label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>

              <div className="form-group">
                <label>End Time</label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Example: Main Auditorium"
                />
              </div>

              <div className="form-group">
                <label>Event Image</label>

                <div className="image-upload-box">

                  {!imagePreview ? (
                    <>
                      <div className="image-upload-icon">
                        📷
                      </div>

                      <p>
                        Upload an image for your event
                      </p>

                      <span>
                        JPG, PNG or WEBP • Max 10 MB
                      </span>

                      <label className="image-select-button">
                        Choose Image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageChange
                          }
                        />
                      </label>
                    </>
                  ) : (
                    <div className="image-preview-wrapper">

                      <img
                        src={imagePreview}
                        alt="Event"
                        className="image-preview"
                      />

                      <div className="image-preview-actions">

                        <label className="image-change-button">
                          Change Image

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                              handleImageChange
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="image-remove-button"
                          onClick={
                            handleRemoveImage
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>
                  )}

                </div>
              </div>

              <div className="form-group">
                <label>
                  Registration Link
                </label>

                <input
                  type="url"
                  value={registrationLink}
                  onChange={(event) =>
                    setRegistrationLink(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/register"
                />
              </div>

              <button
                className="submit-event-button"
                type="submit"
                disabled={
                  submitting ||
                  uploadingImage
                }
              >
                {uploadingImage
                  ? 'Uploading image...'
                  : submitting
                    ? 'Adding...'
                    : 'Add Event'}
              </button>

            </form>

          </div>

        </section>
      )}

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