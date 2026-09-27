import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getListings } from '../api'
import ListingCard from '../components/ListingCard'
import './Marketplace.css'

function Marketplace() {
  const navigate = useNavigate()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListings()

        const formattedListings = data.listings.map(
          (listing) => ({
            ...listing,
            id: listing._id,
          })
        )

        setListings(formattedListings)
      } catch (error) {
        console.error(
          'Failed to fetch listings:',
          error
        )

        alert(
          error.message ||
            'Failed to fetch listings'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="marketplace-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

     <section className="marketplace-header">

  <button
    type="button"
    className="marketplace-back-button"
    onClick={handleBack}
    aria-label="Go back"
  >
    <span>←</span>
    <span>Back</span>
  </button>

  <div className="marketplace-header-content">

    <div className="marketplace-eyebrow">
      <span className="marketplace-eyebrow-dot"></span>
      CAMPUS MARKETPLACE
    </div>

    <h1>
      Buy. Sell. <span>Connect.</span>
    </h1>

    <p>
      Discover useful items from your campus
      community or sell things you no longer need.
    </p>

  </div>

  <Link
    to="/marketplace/create"
    className="post-item-button"
  >
    <span className="post-item-icon">+</span>
    Post an Item
  </Link>

</section>

      {/* =================================================
          MARKETPLACE CONTENT
          ================================================= */}

      <main className="marketplace-content">

        <div className="marketplace-section-heading">

          <div>

            <span className="marketplace-section-label">
              DISCOVER ITEMS
            </span>

            <h2>
              Available Items
            </h2>

            <p>
              Find what you need from fellow students
              on your campus.
            </p>

          </div>


          {!loading && (
            <div className="marketplace-count">

              <strong>
                {listings.length}
              </strong>

              <span>
                {listings.length === 1
                  ? 'Item Available'
                  : 'Items Available'}
              </span>

            </div>
          )}

        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading ? (

          <div className="marketplace-state">

            <div className="marketplace-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <h3>
              Loading marketplace
            </h3>

            <p>
              Finding the latest items from
              your campus community...
            </p>

          </div>

        ) : listings.length === 0 ? (

          /* =================================================
             EMPTY STATE
             ================================================= */

          <div className="marketplace-empty">

            <div className="marketplace-empty-icon">
              🛍️
            </div>

            <span className="marketplace-empty-label">
              MARKETPLACE
            </span>

            <h3>
              Nothing here yet
            </h3>

            <p>
              Be the first student to post something
              useful for your campus community.
            </p>

            <Link
              to="/marketplace/create"
              className="marketplace-empty-button"
            >
              Post the First Item
              <span>→</span>
            </Link>

          </div>

        ) : (

          /* =================================================
             LISTINGS
             ================================================= */

          <div className="listings-grid">

            {listings.map((item) => (

              <div
                key={item.id}
                className="marketplace-listing-wrapper"
              >

                <ListingCard
                  item={item}
                />

              </div>

            ))}

          </div>

        )}

      </main>


      {/* =================================================
          BOTTOM INFO
          ================================================= */}

      {!loading && listings.length > 0 && (

        <section className="marketplace-bottom">

          <div className="marketplace-bottom-icon">
            💡
          </div>

          <div>
            <h3>
              Have something useful to sell?
            </h3>

            <p>
              Help another student while making
              space for yourself.
            </p>
          </div>

          <Link
            to="/marketplace/create"
            className="marketplace-bottom-button"
          >
            Post an Item
            <span>→</span>
          </Link>

        </section>

      )}

    </div>
  )
}

export default Marketplace