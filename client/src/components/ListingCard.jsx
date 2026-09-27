import { Link } from 'react-router-dom'

function ListingCard({ item }) {
  return (
    <Link
      to={`/marketplace/${item._id}`}
      className="listing-card"
    >

      <div className="listing-image">

        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
          />
        ) : (
          <span>No image</span>
        )}

      </div>

      <div className="listing-details">

        <div className="listing-card-top">

          <h3>{item.title}</h3>

          <strong>
            {item.isFree
              ? 'Free'
              : `₹${item.price}`}
          </strong>

        </div>

        <p>
          {item.description}
        </p>

        <div className="listing-meta">

          <span>
            {item.category}
          </span>

          <span>
            {item.condition}
          </span>

        </div>

        <p className="listing-location">
          📍 {item.location}
        </p>

      </div>

    </Link>
  )
}

export default ListingCard