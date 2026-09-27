import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createListing,
  uploadToCloudinary,
} from '../api'
import './CreateListing.css'

function CreateListing() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [location, setLocation] = useState('')

  const [loading, setLoading] = useState(false)
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

    if (!file) {
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPG, PNG, or WEBP image')
      event.target.value = ''
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      alert('Image size must be 10 MB or less')
      event.target.value = ''
      return
    }

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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

    if (!condition) {
      alert('Please select the item condition')
      return
    }

    if (!location.trim()) {
      alert('Please enter a pickup location')
      return
    }

    if (!isFree && price === '') {
      alert('Please enter a price or select free')
      return
    }

    const numericPrice = isFree ? 0 : Number(price)

    if (
      !isFree &&
      (Number.isNaN(numericPrice) || numericPrice < 0)
    ) {
      alert('Please enter a valid price')
      return
    }

    try {
      setLoading(true)

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

      await createListing({
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        isFree,
        category,
        condition,
        image,
        imagePublicId,
        location: location.trim(),
      })

      alert('Item posted successfully!')

      navigate('/marketplace')
    } catch (error) {
      console.error('Create listing error:', error)

      alert(
        error.message ||
          'Failed to post item'
      )
    } finally {
      setUploadingImage(false)
      setLoading(false)
    }
  }

  return (
    <div className="create-listing-page">
      <div className="create-listing-container">

        <h1>Post an Item</h1>

        <p className="listing-form-subtitle">
          Sell or give away useful items to
          fellow students.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Item Title</label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: Study Table"
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
                setCategory(event.target.value)
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
                setCondition(event.target.value)
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

              {!imagePreview ? (
                <>
                  <div className="image-upload-icon">
                    📷
                  </div>

                  <p>
                    Upload an image of your item
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

          <div className="form-group">
            <label>Pickup Location</label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Example: Hostel 3, Main Gate"
            />
          </div>

          <div className="free-option">

            <input
              type="checkbox"
              checked={isFree}
              onChange={(event) =>
                setIsFree(event.target.checked)
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
                  setPrice(event.target.value)
                }
                placeholder="Enter price"
              />

            </div>
          )}

          <button
            className="submit-button"
            type="submit"
            disabled={
              loading ||
              uploadingImage
            }
          >
            {uploadingImage
              ? 'Uploading image...'
              : loading
                ? 'Posting...'
                : 'Post Item'}
          </button>

        </form>

      </div>
    </div>
  )
}

export default CreateListing