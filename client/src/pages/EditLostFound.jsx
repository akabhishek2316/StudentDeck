import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  getLostFoundPost,
  updateLostFoundPost,
  uploadToCloudinary,
} from '../api'
import './LostFound.css'

function EditLostFound() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [type, setType] = useState('lost')
  const [title, setTitle] = useState('')
  const [description, setDescription] =
    useState('')
  const [category, setCategory] =
    useState('')
  const [location, setLocation] =
    useState('')
  const [date, setDate] = useState('')
  const [contactInfo, setContactInfo] =
    useState('')

  const [image, setImage] = useState('')
  const [imagePublicId, setImagePublicId] =
    useState('')

  const [newImageFile, setNewImageFile] =
    useState(null)
  const [imagePreview, setImagePreview] =
    useState('')

  const [loading, setLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)
  const [uploadingImage, setUploadingImage] =
    useState(false)

  useEffect(() => {
    loadPost()
  }, [id])

  const loadPost = async () => {
    try {
      const data =
        await getLostFoundPost(id)

      const post = data.post

      setType(post.type || 'lost')
      setTitle(post.title || '')
      setDescription(
        post.description || ''
      )
      setCategory(post.category || '')
      setLocation(post.location || '')

      if (post.date) {
        setDate(
          new Date(post.date)
            .toISOString()
            .split('T')[0]
        )
      }

      setContactInfo(
        post.contactInfo || ''
      )

      setImage(post.image || '')

      setImagePublicId(
        post.imagePublicId || ''
      )

      setImagePreview(
        post.image || ''
      )
    } catch (error) {
      alert(
        error.message ||
          'Failed to load Lost & Found post'
      )

      navigate('/lost-found')
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      alert(
        'Please enter an item title'
      )
      return
    }

    if (!description.trim()) {
      alert(
        'Please enter a description'
      )
      return
    }

    if (!category) {
      alert(
        'Please select a category'
      )
      return
    }

    if (!location.trim()) {
      alert(
        'Please enter the location'
      )
      return
    }

    if (!date) {
      alert(
        'Please select the date'
      )
      return
    }

    if (!contactInfo.trim()) {
      alert(
        'Please enter contact information'
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

      await updateLostFoundPost(id, {
        type,
        title: title.trim(),
        description:
          description.trim(),
        category: category.trim(),
        location: location.trim(),
        date,
        image: finalImage,
        imagePublicId:
          finalImagePublicId,
        contactInfo:
          contactInfo.trim(),
      })

      alert(
        'Lost & Found post updated successfully'
      )

      navigate(
        `/lost-found/${id}`
      )
    } catch (error) {
      console.error(
        'Update Lost & Found post error:',
        error
      )

      alert(
        error.message ||
          'Failed to update Lost & Found post'
      )
    } finally {
      setUploadingImage(false)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="lost-found-details-page">

        <div className="lost-found-details-not-found">

          <h1>
            Loading...
          </h1>

        </div>

      </div>
    )
  }

  return (
    <div className="report-section">

      <div className="report-container">

        <h2>
          Edit Lost &amp; Found Post
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

            <label>
              Item Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
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
            />

          </div>

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
            />

          </div>

          <div className="form-group">

            <label>
              Item Image
            </label>

            <div className="image-upload-box">

              {imagePreview ? (
                <div className="image-preview-wrapper">

                  <img
                    src={imagePreview}
                    alt="Lost or found item"
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
                    Add an image of the
                    item
                  </p>

                  <span>
                    JPG, PNG or WEBP •
                    Max 10 MB
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

          <button
            className="submit-report-button"
            type="submit"
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

    </div>
  )
}

export default EditLostFound