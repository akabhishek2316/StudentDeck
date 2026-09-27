import { useEffect, useState } from 'react'
import { Link,useNavigate  } from 'react-router-dom'
import {
  getLostFoundPosts,
  createLostFoundPost,
  uploadToCloudinary,
} from '../api'
import './LostFound.css'

function LostFound() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const [type, setType] = useState('lost')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const loadPosts = async () => {
    try {
      setLoading(true)

      const data = await getLostFoundPosts()

      const formattedPosts = (data.posts || []).map((post) => ({
        ...post,
        id: post._id,
        type: post.type,
      }))

      setItems(formattedPosts)
    } catch (error) {
      console.error(
        'Failed to load Lost & Found posts:',
        error
      )

      alert(
        error.message ||
          'Failed to load Lost & Found posts'
      )
    } finally {
      setLoading(false)
    }
  }

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
        `${
          type === 'lost' ? 'Lost' : 'Found'
        } item reported successfully!`
      )

      resetForm()
      setShowForm(false)

      await loadPosts()
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

  const filteredItems = items.filter((item) => {
    const currentType =
      item.type === 'lost' ? 'Lost' : 'Found'

    const matchesFilter =
      filter === 'All' ||
      currentType === filter

    const searchText =
      search.toLowerCase()

    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(searchText) ||
      item.description
        .toLowerCase()
        .includes(searchText) ||
      item.location
        .toLowerCase()
        .includes(searchText)

    return matchesFilter && matchesSearch
  })

  return (
    <div className="lost-found-page">

      {/* =====================================================
          PREMIUM HEADER
          ===================================================== */}

      <section className="lost-found-header">

  <div className="lost-found-header-inner">

    {/* LEFT — BACK */}
    <button
      type="button"
      className="lost-found-back-button"
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
    <div className="lost-found-header-center">

      <span className="lost-found-eyebrow">
        CAMPUS LOST &amp; FOUND
      </span>

      <h1>
        Lost &amp; Found
      </h1>

      <p>
        Find lost items or report something you found on campus.
      </p>

    </div>


    {/* RIGHT — REPORT */}
    <button
      type="button"
      className="report-button"
      onClick={() =>
        setShowForm((current) => !current)
      }
    >
      {showForm
        ? 'Close Form'
        : 'Report an Item'}
    </button>

  </div>

</section>


      {/* =====================================================
          REPORT FORM
          ===================================================== */}

      {showForm && (
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

                <label>
                  Item Title
                </label>

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
                  placeholder="Describe the item..."
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
                  placeholder="Example: Central Library"
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

                <label>
                  Item Image
                </label>

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
      )}


      {/* =====================================================
          ITEMS CONTENT
          ===================================================== */}

      <section className="lost-found-content">

        <div className="lost-found-toolbar">

          <input
            type="text"
            placeholder="Search lost or found items..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="All">
              All Items
            </option>

            <option value="Lost">
              Lost Items
            </option>

            <option value="Found">
              Found Items
            </option>
          </select>

        </div>


        <h2>
          {filter === 'All'
            ? 'All Items'
            : `${filter} Items`}
        </h2>


        {loading ? (
          <div className="no-items">
            <h3>
              Loading items...
            </h3>
          </div>
        ) : filteredItems.length > 0 ? (

          <div className="lost-found-grid">

            {filteredItems.map((item) => (

              <Link
                to={`/lost-found/${item._id}`}
                className="lost-found-card"
                key={item._id}
              >

                <div className="lost-found-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <span>
                      No image
                    </span>
                  )}

                </div>


                <div className="lost-found-details">

                  <div className="card-title-row">

                    <h3>
                      {item.title}
                    </h3>

                    <span
                      className={
                        item.type === 'lost'
                          ? 'status lost'
                          : 'status found'
                      }
                    >
                      {item.type === 'lost'
                        ? 'Lost'
                        : 'Found'}
                    </span>

                  </div>


                  <p>
                    {item.description}
                  </p>


                  <div className="item-info">

                    <span>
                      Category:{' '}
                      {item.category}
                    </span>

                    <span>
                      📍 {item.location}
                    </span>

                    <span>
                      📅 {item.date}
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        ) : (

          <div className="no-items">

            <h3>
              No items found
            </h3>

            <p>
              Try changing your search or
              filter.
            </p>

          </div>

        )}

      </section>

    </div>
  )
}

export default LostFound