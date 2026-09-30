import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getLostFoundPosts,
} from '../api'
import './LostFound.css'
import PageHeader from '../components/PageHeader'

function LostFound() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    loadPosts()
  }, [])



  const formatDate = (value) => {
    if (!value) {
      return ''
    }

    return new Date(value).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

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

      <PageHeader
        eyebrow="Campus Community"
        title="Lost & Found"
        description="Report lost items and help fellow students find what they have lost."
        backTo="/"
        actionTo="/lost-found/create"
        actionText="Report Item"
        actionIcon="+"
      />


      {/* =====================================================
          REPORT FORM
          ===================================================== */}




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
                      📅 {formatDate(item.date)}
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