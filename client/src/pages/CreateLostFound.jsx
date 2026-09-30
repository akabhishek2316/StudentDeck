import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  createLostFoundPost,
  uploadToCloudinary,
} from '../api'
import './CreateLostFound.css'
import PageHeader from '../components/PageHeader'

function CreateLostFound() {
  const navigate = useNavigate()

  const [type, setType] = useState('lost')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

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

    const maxSize = 10 * 1024 * 1024

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
    setCategory('')
    setLocation('')
    setDate('')
    setImageFile(null)
    setImagePreview('')
    setContactInfo('')
    setType('lost')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      alert('Please enter an item title')
      return
    }

    if (!description.trim()) {
      alert('Please enter a description')
      return
    }

    if (!category) {
      alert('Please select a category')
      return
    }

    if (!location.trim()) {
      alert('Please enter the location')
      return
    }

    if (!date) {
      alert('Please select the date')
      return
    }

    if (!contactInfo.trim()) {
      alert('Please enter contact information')
      return
    }

    try {
      setSubmitting(true)

      let image = ''
      let imagePublicId = ''

      if (imageFile) {
        setUploadingImage(true)

        const uploadResult =
          await uploadToCloudinary(imageFile)

        image = uploadResult.secureUrl
        imagePublicId = uploadResult.publicId

        setUploadingImage(false)
      }

      await createLostFoundPost({
        type,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        date,
        image,
        imagePublicId,
        contactInfo: contactInfo.trim(),
      })

      alert(
        `${type === 'lost'
          ? 'Lost'
          : 'Found'
        } item reported successfully!`
      )

      resetForm()

      navigate('/lost-found')
    } catch (error) {
      console.error(
        'Create Lost & Found post error:',
        error
      )

      alert(
        error.message ||
        'Failed to create Lost & Found post'
      )
    } finally {
      setUploadingImage(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="lost-found-page">



      <PageHeader
        eyebrow="CAMPUS LOST &amp; FOUND"
        title="Report Lost &amp; Found"
        description="Report a lost item or something you
              found on campus."
        backTo="/lost-found"

      />

      <section className="report-section">

        <div className="report-container">

          <h2>
            Report Lost or Found Item
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Item Status
              </label>

              <div className="type-buttons">

                <button
                  type="button"
                  className={
                    type === 'lost'
                      ? 'type-button active'
                      : 'type-button'
                  }
                  onClick={() =>
                    setType('lost')
                  }
                >
                  I Lost Something
                </button>

                <button
                  type="button"
                  className={
                    type === 'found'
                      ? 'type-button active'
                      : 'type-button'
                  }
                  onClick={() =>
                    setType('found')
                  }
                >
                  I Found Something
                </button>

              </div>

            </div>

            <div className="form-group">
              <label>Item Title</label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Example: Black Wallet"
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
                placeholder="Describe the item..."
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
                  Select a category
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Personal">
                  Personal Items
                </option>

                <option value="Books">
                  Books
                </option>

                <option value="Clothing">
                  Clothing
                </option>

                <option value="Documents">
                  Documents
                </option>

                <option value="Others">
                  Others
                </option>
              </select>
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
                placeholder="Example: Central Library"
              />
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                Contact Information
              </label>

              <input
                type="text"
                value={contactInfo}
                onChange={(event) =>
                  setContactInfo(
                    event.target.value
                  )
                }
                placeholder="Phone number or email"
              />
            </div>

            <div className="form-group">

              <label>Item Image</label>

              <div className="image-upload-box">

                {!imagePreview ? (
                  <>
                    <div className="image-upload-icon">
                      📷
                    </div>

                    <p>
                      Upload an image of the
                      lost or found item
                    </p>

                    <span>
                      JPG, PNG or WEBP • Max 10 MB
                    </span>

                    <label className="image-select-button">
                      Choose Image

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>
                  </>
                ) : (
                  <div className="image-preview-wrapper">

                    <img
                      src={imagePreview}
                      alt="Selected item"
                      className="image-preview"
                    />

                    <div className="image-preview-actions">

                      <label className="image-change-button">
                        Change Image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                        />
                      </label>

                      <button
                        type="button"
                        className="image-remove-button"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                )}

              </div>

            </div>

            <button
              className="submit-report-button"
              type="submit"
              disabled={
                submitting ||
                uploadingImage
              }
            >
              {uploadingImage
                ? 'Uploading image...'
                : submitting
                  ? 'Reporting...'
                  : 'Report Item'}
            </button>

          </form>

        </div>

      </section>

    </div>
  )
}

export default CreateLostFound