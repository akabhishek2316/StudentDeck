import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  createEvent,
  uploadToCloudinary,
} from '../api'
import './CreateEvent.css'

function CreateEvent() {
  const navigate = useNavigate()

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

  const [submitting, setSubmitting] =
    useState(false)
  const [uploadingImage, setUploadingImage] =
    useState(false)

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

    const [hours, minutes] =
      value.split(':')

    const hour = Number(hours)

    const period =
      hour >= 12 ? 'PM' : 'AM'

    const hour12 =
      hour % 12 || 12

    return `${hour12}:${minutes} ${period}`
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

      navigate('/events')
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

  return (
    <div className="events-page">



      <div className="create-event-topbar">
        <button
          type="button"
          className="create-event-back-button"
          onClick={() => navigate('/events')}
        >
          <span className="back-arrow">←</span>
          <span>Back to Events</span>
        </button>
      </div>

      <section className="event-form-section">

        <div className="event-form-container">

          <h2>
            Add Campus Event
          </h2>

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

                {!imagePreview ? (

                  <>
                    <div className="image-upload-icon">
                      📷
                    </div>

                    <p>
                      Upload an image for your
                      event
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

    </div>
  )
}

export default CreateEvent