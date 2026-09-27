import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  getEvent,
  getMe,
  updateEvent,
  uploadToCloudinary,
} from '../api'
import './Events.css'

function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [currentUser, setCurrentUser] =
    useState(null)

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

  const [image, setImage] = useState('')
  const [imagePublicId, setImagePublicId] =
    useState('')
  const [newImageFile, setNewImageFile] =
    useState(null)
  const [imagePreview, setImagePreview] =
    useState('')

  const [registrationLink, setRegistrationLink] =
    useState('')

  const [loading, setLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)
  const [uploadingImage, setUploadingImage] =
    useState(false)
  const [error, setError] =
    useState('')

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

      const loadedEvent =
        eventData.event

      setEvent(loadedEvent)
      setCurrentUser(userData.user)

      setTitle(
        loadedEvent.title || ''
      )

      setDescription(
        loadedEvent.description || ''
      )

      setOrganizer(
        loadedEvent.organizer || ''
      )

      if (loadedEvent.date) {
        const eventDate =
          new Date(loadedEvent.date)

        if (
          !Number.isNaN(
            eventDate.getTime()
          )
        ) {
          setDate(
            eventDate
              .toISOString()
              .split('T')[0]
          )
        } else {
          setDate('')
        }
      } else {
        setDate('')
      }

      setStartTime(
        loadedEvent.startTime || ''
      )

      setEndTime(
        loadedEvent.endTime || ''
      )

      setLocation(
        loadedEvent.location || ''
      )

      setCategory(
        loadedEvent.category || ''
      )

      setImage(
        loadedEvent.image || ''
      )

      setImagePublicId(
        loadedEvent.imagePublicId || ''
      )

      setImagePreview(
        loadedEvent.image || ''
      )

      setRegistrationLink(
        loadedEvent.registrationLink || ''
      )
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

    setNewImageFile(file)

    const reader =
      new FileReader()

    reader.onload = () => {
      setImagePreview(
        reader.result
      )
    }

    reader.onerror = () => {
      alert(
        'Failed to preview image'
      )
    }

    reader.readAsDataURL(file)
  }

  const handleKeepExistingImage =
    () => {
      setNewImageFile(null)

      setImagePreview(
        image || ''
      )
    }

  const handleSubmit = async (
    eventObject
  ) => {
    eventObject.preventDefault()

    if (!isOwner) {
      alert(
        'You can only edit your own events'
      )
      return
    }

    if (!title.trim()) {
      alert(
        'Please enter an event title'
      )
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
      alert(
        'Please select an event date'
      )
      return
    }

    if (!startTime) {
      alert(
        'Please select the start time'
      )
      return
    }

    if (!location.trim()) {
      alert(
        'Please enter the event location'
      )
      return
    }

    if (!category.trim()) {
      alert(
        'Please select the event category'
      )
      return
    }

    try {
      setSaving(true)

      let finalImage = image
      let finalImagePublicId =
        imagePublicId

      if (newImageFile) {
        setUploadingImage(true)

        const uploadResult =
          await uploadToCloudinary(
            newImageFile
          )

        finalImage =
          uploadResult.secureUrl

        finalImagePublicId =
          uploadResult.publicId

        setUploadingImage(false)
      }

      await updateEvent(id, {
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
        image: finalImage,
        imagePublicId:
          finalImagePublicId,
        registrationLink:
          registrationLink.trim(),
      })

      alert(
        'Event updated successfully'
      )

      navigate(`/events/${id}`)
    } catch (error) {
      console.error(
        'Failed to update event:',
        error
      )

      alert(
        error.message ||
          'Failed to update event'
      )
    } finally {
      setUploadingImage(false)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="event-details-not-found">
        <h1>Loading...</h1>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-details-not-found">

        <h1>Event Not Found</h1>

        <p>
          {error ||
            'This event is unavailable.'}
        </p>

        <button
          type="button"
          className="event-edit-button"
          onClick={() =>
            navigate('/events')
          }
        >
          ← Back to Events
        </button>

      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="event-details-not-found">

        <h1>Access Denied</h1>

        <p>
          You can only edit your own
          events.
        </p>

        <button
          type="button"
          className="event-edit-button"
          onClick={() =>
            navigate(`/events/${id}`)
          }
        >
          ← Back to Event
        </button>

      </div>
    )
  }

  return (
    <div className="events-page">

      <section className="events-header">

        <h1>Edit Event</h1>

        <p>
          Update your event details.
        </p>

      </section>

      <section className="event-form-section">

        <div className="event-form-container">

          <h2>Edit Campus Event</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>
                Event Title
              </label>

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
              <label>
                Description
              </label>

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
              <label>
                Organizer
              </label>

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
              <label>
                Category
              </label>

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
                <label>
                  Date
                </label>

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
                <label>
                  Start Time
                </label>

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
              <label>
                End Time
              </label>

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
              <label>
                Location
              </label>

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

              <label>
                Event Image
              </label>

              <div className="image-upload-box">

                {imagePreview ? (
                  <div className="image-preview-wrapper">

                    <img
                      src={imagePreview}
                      alt="Event"
                      className="image-preview"
                    />

                    <div className="image-preview-actions">

                      <label className="image-change-button">
                        Replace Image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageChange
                          }
                        />
                      </label>

                      {newImageFile && (
                        <button
                          type="button"
                          className="image-remove-button"
                          onClick={
                            handleKeepExistingImage
                          }
                        >
                          Keep Existing
                        </button>
                      )}

                    </div>

                  </div>
                ) : (
                  <>
                    <div className="image-upload-icon">
                      📷
                    </div>

                    <p>
                      Add an image for your event
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
              type="submit"
              className="submit-event-button"
              disabled={
                saving ||
                uploadingImage
              }
            >
              {uploadingImage
                ? 'Uploading image...'
                : saving
                  ? 'Saving...'
                  : 'Save Changes'}
            </button>

          </form>

        </div>

      </section>

    </div>
  )
}

export default EditEvent