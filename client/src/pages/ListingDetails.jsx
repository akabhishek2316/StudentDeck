import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import {
  getListing,
  getMe,
  deleteListing,
  saveItem,
  checkSaved,
  removeSavedItem,
  createConversation,
} from '../api'

import BackButton from '../components/BackButton'
import UnauthorizedAccess from '../components/UnauthorizedAccess'

import './ListingDetails.css'


function ListingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [error, setError] = useState('')
  const [contacting, setContacting] = useState(false)


  useEffect(() => {
    loadListing()
  }, [id])


  const loadListing = async () => {
    try {
      setLoading(true)
      setError('')


      /*
       * First check whether user is logged in
       */
      let userData

      try {
        userData = await getMe()
      } catch (authError) {
        console.log(
          'User is not logged in'
        )

        setAuthorized(false)
        setCurrentUser(null)
        setItem(null)

        return
      }


      if (!userData?.user) {
        setAuthorized(false)
        setCurrentUser(null)
        setItem(null)

        return
      }


      /*
       * User is authenticated
       */
      setAuthorized(true)
      setCurrentUser(userData.user)


      /*
       * Load marketplace listing
       */
      const listingData =
        await getListing(id)

      const listing =
        listingData.listing

      setItem(listing)


      /*
       * Check saved status only
       * for another user's listing
       */
      if (
        listing &&
        String(listing.seller?._id) !==
        String(userData.user._id)
      ) {
        try {
          const savedData =
            await checkSaved(
              'marketplace',
              id
            )

          setIsSaved(
            Boolean(savedData?.saved)
          )

        } catch (savedError) {
          console.error(
            'Failed to check saved status:',
            savedError
          )

          setIsSaved(false)
        }
      } else {
        setIsSaved(false)
      }

    } catch (error) {
      console.error(
        'Failed to load listing:',
        error
      )

      setError(
        error.message ||
        'Failed to load listing'
      )

    } finally {
      setLoading(false)
    }
  }


  const isOwner =
    item &&
    currentUser &&
    String(item.seller?._id) ===
    String(currentUser._id)


  const handleSave = async () => {
    try {
      setSaving(true)

      if (isSaved) {
        await removeSavedItem(
          'marketplace',
          id
        )

        setIsSaved(false)

      } else {
        await saveItem(
          'marketplace',
          id
        )

        setIsSaved(true)
      }

    } catch (error) {
      console.error(
        'Failed to update saved item:',
        error
      )

      alert(
        error.message ||
        'Failed to update saved item'
      )

    } finally {
      setSaving(false)
    }
  }


  const handleContactSeller = async () => {
    if (!item?.seller?._id) {
      return
    }

    try {
      setContacting(true)

      const conversation =
        await createConversation(
          item.seller._id
        )

      navigate('/messages', {
        state: {
          conversationId:
            conversation?.conversation?._id ||
            conversation?._id,
        },
      })

    } catch (error) {
      console.error(
        'Failed to start conversation:',
        error
      )

      alert(
        error.message ||
        'Failed to start a conversation with the seller'
      )

    } finally {
      setContacting(false)
    }
  }


  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this listing?'
      )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)

      await deleteListing(id)

      alert(
        'Listing deleted successfully'
      )

      navigate('/marketplace')

    } catch (error) {
      console.error(
        'Failed to delete listing:',
        error
      )

      alert(
        error.message ||
        'Failed to delete listing'
      )

    } finally {
      setDeleting(false)
    }
  }


  /*
   * Login required
   */
  if (authorized === false) {
    return (
      <UnauthorizedAccess
        title="Login Required"
        message="You need to login to view marketplace listings."
        buttonText="Go to Login"
      />
    )
  }


  /*
   * Loading
   */
  if (
    loading ||
    authorized === null
  ) {
    return (
      <div className="listing-status-page">

        <div className="listing-status-card loading-card">

          <div className="listing-status-icon loading-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span className="listing-status-label">
            MARKETPLACE
          </span>

          <h1>
            Loading listing
          </h1>

          <p>
            Please wait while we retrieve this item
            from the campus marketplace.
          </p>

        </div>

      </div>
    )
  }


  /*
   * Listing not found / API error
   */
  if (
    error ||
    !item
  ) {
    return (
      <div className="listing-status-page">

        <div className="listing-status-card">

          <div className="listing-status-icon">
            <span>⌁</span>
          </div>

          <span className="listing-status-label">
            MARKETPLACE
          </span>

          <h1>
            This listing isn’t available
          </h1>

          <p>
            {error ||
              'This item may have been removed or is no longer available.'}
          </p>

          <div className="listing-status-actions">

            <Link
              to="/marketplace"
              className="status-primary-button"
            >
              <span>←</span>
              Back to Marketplace
            </Link>

            <Link
              to="/"
              className="status-secondary-button"
            >
              Go to Home
            </Link>

          </div>

        </div>

      </div>
    )
  }


  return (
    <div className="listing-details-page">

      <div className="listing-details-container">

        <BackButton
          label="Back to Marketplace"
          fallback="/marketplace"
        />


        <div className="listing-details-card">


          <div className="listing-details-image">

            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
              />
            ) : (
              <span>
                No image available
              </span>
            )}

          </div>


          <div className="listing-details-content">


            <div className="listing-details-title-row">

              <h1>
                {item.title}
              </h1>

              <strong className="listing-price">
                {item.isFree
                  ? 'Free'
                  : `₹${item.price}`}
              </strong>

            </div>


            <p className="listing-description">
              {item.description}
            </p>


            <div className="listing-tags">

              <span>
                {item.category}
              </span>

              <span>
                {item.condition}
              </span>

            </div>


            <div className="listing-information">


              <div className="information-item">

                <span>📍</span>

                <div>

                  <small>
                    Pickup Location
                  </small>

                  <p>
                    {item.location}
                  </p>

                </div>

              </div>


              <div className="information-item">

                <span>🏷️</span>

                <div>

                  <small>
                    Category
                  </small>

                  <p>
                    {item.category}
                  </p>

                </div>

              </div>


              <div className="information-item">

                <span>✨</span>

                <div>

                  <small>
                    Condition
                  </small>

                  <p>
                    {item.condition}
                  </p>

                </div>

              </div>


              <div className="information-item">

                <span>💰</span>

                <div>

                  <small>
                    Price
                  </small>

                  <p>
                    {item.isFree
                      ? 'Free'
                      : `₹${item.price}`}
                  </p>

                </div>

              </div>


            </div>


            <div className="seller-section">

              <h2>
                Interested in this item?
              </h2>

              <p>
                Contact the seller through
                StudentDeck to discuss the item
                and arrange a meeting.
              </p>


              <div className="listing-action-buttons">


                <button
                  type="button"
                  className="contact-seller-button"
                  onClick={
                    handleContactSeller
                  }
                  disabled={contacting}
                >
                  {contacting
                    ? 'Starting chat...'
                    : 'Contact Seller'}
                </button>


                {!isOwner && (
                  <button
                    type="button"
                    className={`save-listing-button ${isSaved
                        ? 'saved'
                        : ''
                      }`}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving
                      ? 'Updating...'
                      : isSaved
                        ? '✓ Saved'
                        : '🔖 Save'}
                  </button>
                )}


                {isOwner && (
                  <>

                    <Link
                      to={`/marketplace/${id}/edit`}
                      className="edit-listing-button"
                    >
                      Edit Listing
                    </Link>


                    <button
                      type="button"
                      className="delete-listing-button"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting
                        ? 'Deleting...'
                        : 'Delete Listing'}
                    </button>

                  </>
                )}


              </div>

            </div>


          </div>

        </div>

      </div>

    </div>
  )
}


export default ListingDetails