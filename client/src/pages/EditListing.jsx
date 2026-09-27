import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  getListing,
  updateListing,
  uploadToCloudinary,
} from '../api'
import './CreateListing.css'

function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] =
    useState('')
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [category, setCategory] =
    useState('')
  const [condition, setCondition] =
    useState('')

  const [image, setImage] = useState('')
  const [imagePublicId, setImagePublicId] =
    useState('')

  const [newImageFile, setNewImageFile] =
    useState(null)

  const [imagePreview, setImagePreview] =
    useState('')

  const [location, setLocation] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [uploadingImage, setUploadingImage] =
    useState(false)

  useEffect(() => {
    loadListing()
  }, [id])

  const loadListing = async () => {
    try {
      const data = await getListing(id)
      const listing = data.listing

      setTitle(listing.title || '')
      setDescription(
        listing.description || ''
      )
      setPrice(listing.price ?? '')
      setIsFree(
        listing.isFree || false
      )
      setCategory(
        listing.category || ''
      )
      setCondition(
        listing.condition || ''
      )

      setImage(
        listing.image || ''
      )

      setImagePublicId(
        listing.imagePublicId || ''
      )

      setImagePreview(
        listing.image || ''
      )

      setLocation(
        listing.location || ''
      )
    } catch (error) {
      alert(
        error.message ||
          'Failed to load listing'
      )

      navigate('/marketplace')
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

  const handleSubmit = async (
    event
  ) => {
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

    if (!condition) {
      alert(
        'Please select the item condition'
      )
      return
    }

    if (!location.trim()) {
      alert(
        'Please enter a pickup location'
      )
      return
    }

    if (!isFree && price === '') {
      alert(
        'Please enter a price or select free'
      )
      return
    }

    const numericPrice =
      isFree
        ? 0
        : Number(price)

    if (
      !isFree &&
      (Number.isNaN(numericPrice) ||
        numericPrice < 0)
    ) {
      alert(
        'Please enter a valid price'
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

      await updateListing(id, {
        title: title.trim(),
        description:
          description.trim(),
        price: numericPrice,
        isFree,
        category,
        condition,
        image: finalImage,
        imagePublicId:
          finalImagePublicId,
        location:
          location.trim(),
      })

      alert(
        'Listing updated successfully'
      )

      navigate(
        `/marketplace/${id}`
      )
    } catch (error) {
      console.error(
        'Update listing error:',
        error
      )

      alert(
        error.message ||
          'Failed to update listing'
      )
    } finally {
      setUploadingImage(false)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="listing-not-found">
        <h1>Loading...</h1>
      </div>
    )
  }

  return (
    <div className="create-listing-page">

      <div className="create-listing-container">

        <h1>Edit Listing</h1>

        <p className="listing-form-subtitle">
          Update your item details or
          replace its image.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Item Title</label>

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
            <label>Description</label>

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

              <option value="furniture">
                Furniture
              </option>

              <option value="electronics">
                Electronics
              </option>

              <option value="books">
                Books
              </option>

              <option value="cycles">
                Cycles
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>

            <select
              value={condition}
              onChange={(event) =>
                setCondition(
                  event.target.value
                )
              }
            >
              <option value="">
                Select condition
              </option>

              <option value="new">
                New
              </option>

              <option value="good">
                Good
              </option>

              <option value="used">
                Used
              </option>
            </select>
          </div>

          <div className="form-group">

            <label>Item Image</label>

            <div className="image-upload-box">

              {imagePreview ? (
                <div className="image-preview-wrapper">

                  <img
                    src={imagePreview}
                    alt="Listing item"
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
                    Add an image of your
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

          <div className="form-group">

            <label>
              Pickup Location
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

          <div className="free-option">

            <input
              type="checkbox"
              checked={isFree}
              onChange={(event) =>
                setIsFree(
                  event.target.checked
                )
              }
            />

            <label>
              Give away for free
            </label>

          </div>

          {!isFree && (
            <div className="form-group">

              <label>Price</label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value
                  )
                }
              />

            </div>
          )}

          <button
            className="submit-button"
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

export default EditListing