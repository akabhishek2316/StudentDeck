import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSavedItems,
  removeSavedItem,
} from '../api'
import './Saved.css'

function Saved() {
  const navigate = useNavigate()

  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSavedItems()
  }, [])

  const loadSavedItems = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getSavedItems()

      setSavedItems(data.saves || [])
    } catch (error) {
      console.error(
        'Failed to load saved items:',
        error
      )

      setError(
        error.message ||
          'Failed to load saved items'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (
    event,
    itemType,
    itemId
  ) => {
    event.stopPropagation()

    try {
      await removeSavedItem(
        itemType,
        itemId
      )

      setSavedItems((current) =>
        current.filter(
          (item) =>
            !(
              item.itemType === itemType &&
              String(item.itemId) === String(itemId)
            )
        )
      )
    } catch (error) {
      console.error(
        'Failed to remove saved item:',
        error
      )

      setError(
        error.message ||
          'Failed to remove saved item'
      )
    }
  }

  const getItemTypeLabel = (itemType) => {
    switch (itemType) {
      case 'marketplace':
        return 'Marketplace'

      case 'academic':
        return 'Academic Resource'

      case 'event':
        return 'Event'

      case 'lost-found':
        return 'Lost & Found'

      default:
        return 'Saved Item'
    }
  }

  const getItemTitle = (saved) => {
    if (!saved.item) {
      return 'Item no longer available'
    }

    return saved.item.title || 'Untitled Item'
  }

  const getItemImage = (saved) => {
    if (!saved.item) {
      return ''
    }

    if (
      saved.itemType === 'marketplace' ||
      saved.itemType === 'event' ||
      saved.itemType === 'lost-found'
    ) {
      return saved.item.image || ''
    }

    return ''
  }

  const getItemPreview = (saved) => {
    const item = saved.item

    if (!item) {
      return 'This item is no longer available.'
    }

    if (saved.itemType === 'marketplace') {
      return item.description || 'Marketplace listing'
    }

    if (saved.itemType === 'academic') {
      return `${item.subject} • ${item.department} • Year ${item.year}`
    }

    if (saved.itemType === 'event') {
      return `${item.organizer} • ${item.location}`
    }

    if (saved.itemType === 'lost-found') {
      return `${item.type === 'lost' ? 'Lost' : 'Found'} • ${item.location}`
    }

    return ''
  }

  const getItemMeta = (saved) => {
    const item = saved.item

    if (!item) {
      return null
    }

    if (saved.itemType === 'marketplace') {
      return (
        <div className="saved-card-meta">
          <span>
            📍 {item.location}
          </span>

          <strong>
            {item.isFree
              ? 'Free'
              : `₹${item.price}`}
          </strong>
        </div>
      )
    }

    if (saved.itemType === 'academic') {
      return (
        <div className="saved-card-meta">
          <span>
            📚 {item.resourceType}
          </span>

          <span>
            Semester {item.semester}
          </span>
        </div>
      )
    }

    if (saved.itemType === 'event') {
      return (
        <div className="saved-card-meta">
          <span>
            📍 {item.location}
          </span>

          <span>
            🗓️{' '}
            {new Date(
              item.date
            ).toLocaleDateString()}
          </span>
        </div>
      )
    }

    if (saved.itemType === 'lost-found') {
      return (
        <div className="saved-card-meta">
          <span>
            📍 {item.location}
          </span>

          <span>
            {item.type === 'lost'
              ? '🔎 Lost'
              : '📦 Found'}
          </span>
        </div>
      )
    }

    return null
  }

  const getItemPath = (saved) => {
    if (!saved.item) {
      return null
    }

    switch (saved.itemType) {
      case 'marketplace':
        return `/marketplace/${saved.itemId}`

      case 'academic':
        return `/academic/${saved.itemId}`

      case 'event':
        return `/events/${saved.itemId}`

      case 'lost-found':
        return `/lost-found/${saved.itemId}`

      default:
        return null
    }
  }

  const handleCardClick = (saved) => {
    const path = getItemPath(saved)

    if (path) {
      navigate(path)
    }
  }

  const handleCardKeyDown = (
    event,
    saved
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      handleCardClick(saved)
    }
  }

  return (
    <div className="saved-page">

     <section className="saved-header">

  <button
    type="button"
    className="saved-back-button"
    onClick={() => {
      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate('/')
      }
    }}
    aria-label="Go back"
  >
    <span>←</span>
    <span>Back</span>
  </button>

  <div className="saved-header-content">

    <div className="saved-eyebrow">
      <span className="saved-eyebrow-dot"></span>
      YOUR COLLECTION
    </div>

    <h1>
      Saved <span>Items.</span>
    </h1>

    <p>
      Quickly access the Marketplace, Academic Resources,
      Events, and Lost &amp; Found items you saved.
    </p>

  </div>

  <div className="saved-header-spacer"></div>

</section>

      <section className="saved-container">

        {loading ? (
          <div className="saved-empty">

            <div className="saved-loading">
              Loading your saved items...
            </div>

          </div>
        ) : error ? (
          <div className="saved-error">
            {error}
          </div>
        ) : savedItems.length === 0 ? (
          <div className="saved-empty">

            <div className="saved-empty-icon">
              🔖
            </div>

            <h2>
              No saved items yet
            </h2>

            <p>
              Save useful listings, resources,
              events, or Lost & Found posts and
              they will appear here.
            </p>

          </div>
        ) : (
          <div className="saved-grid">

            {savedItems.map((saved) => {
              const image =
                getItemImage(saved)

              const isAvailable =
                Boolean(saved.item)

              return (
                <article
                  key={saved._id}
                  className={`saved-card ${
                    !isAvailable
                      ? 'saved-card-unavailable'
                      : ''
                  }`}
                  onClick={() =>
                    handleCardClick(saved)
                  }
                  onKeyDown={(event) =>
                    handleCardKeyDown(
                      event,
                      saved
                    )
                  }
                  role={
                    isAvailable
                      ? 'button'
                      : undefined
                  }
                  tabIndex={
                    isAvailable
                      ? 0
                      : undefined
                  }
                >

                  <div className="saved-card-image">

                    {image ? (
                      <img
                        src={image}
                        alt={getItemTitle(
                          saved
                        )}
                      />
                    ) : (
                      <div className="saved-card-placeholder">

                        {saved.itemType ===
                        'academic'
                          ? '📚'
                          : saved.itemType ===
                            'event'
                          ? '🎉'
                          : saved.itemType ===
                            'lost-found'
                          ? '🔎'
                          : '📦'}

                      </div>
                    )}

                    <span className="saved-type-badge">
                      {getItemTypeLabel(
                        saved.itemType
                      )}
                    </span>

                  </div>

                  <div className="saved-card-body">

                    <div className="saved-card-title-row">

                      <h3>
                        {getItemTitle(
                          saved
                        )}
                      </h3>

                      <button
                        type="button"
                        className="saved-remove-button"
                        onClick={(event) =>
                          handleRemove(
                            event,
                            saved.itemType,
                            saved.itemId
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>

                    <p className="saved-card-description">
                      {getItemPreview(
                        saved
                      )}
                    </p>

                    {getItemMeta(saved)}

                    {isAvailable && (
                      <div className="saved-view-link">
                        View details →
                      </div>
                    )}

                  </div>

                </article>
              )
            })}

          </div>
        )}

      </section>

    </div>
  )
}

export default Saved