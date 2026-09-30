import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import './Academic.css'
import {
  getAcademicResources,
  getAcademicResourceFile,
} from '../api'
import PageHeader from '../components/PageHeader'

const resourceTypeOptions = [
  {
    value: 'question-paper',
    label: 'Previous Year Paper',
  },
  {
    value: 'notes',
    label: 'Notes',
  },
  {
    value: 'study-material',
    label: 'Study Material',
  },
  {
    value: 'assignment',
    label: 'Assignment',
  },
  {
    value: 'other',
    label: 'Other',
  },
]

const getResourceTypeLabel = (value) => {
  const option = resourceTypeOptions.find(
    (item) => item.value === value
  )

  return option ? option.label : value
}

function Academic() {
  const navigate = useNavigate()

  const [resources, setResources] = useState([])
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResources()
  }, [])

  const handleOpenResource = async (resource) => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login', {
        state: {
          from: `/academic/${resource._id}`,
        },
      })

      return
    }

    try {
      const data =
        await getAcademicResourceFile(
          resource._id
        )

      if (!data.fileUrl) {
        throw new Error(
          'Resource file is unavailable'
        )
      }

      window.open(
        data.fileUrl,
        '_blank',
        'noopener,noreferrer'
      )
    } catch (error) {
      console.error(
        'Failed to open academic resource:',
        error
      )

      alert(
        error.message ||
        'Unable to open resource'
      )
    }
  }

  const loadResources = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAcademicResources()

      setResources(data.resources || [])
    } catch (error) {
      console.error(
        'Failed to load academic resources:',
        error
      )

      setError(
        error.message ||
        'Failed to load academic resources'
      )
    } finally {
      setLoading(false)
    }
  }

  const subjects = useMemo(() => {
    const uniqueSubjects = [
      ...new Set(
        resources
          .map((resource) => resource.subject)
          .filter(Boolean)
      ),
    ]

    return ['All', ...uniqueSubjects]
  }, [resources])

  const filteredResources = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return resources.filter((resource) => {
      const title =
        resource.title?.toLowerCase() || ''

      const subject =
        resource.subject?.toLowerCase() || ''

      const description =
        resource.description?.toLowerCase() || ''

      const department =
        resource.department?.toLowerCase() || ''

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        subject.includes(searchText) ||
        description.includes(searchText) ||
        department.includes(searchText)

      const matchesSubject =
        subjectFilter === 'All' ||
        resource.subject === subjectFilter

      const matchesType =
        typeFilter === 'All' ||
        resource.resourceType === typeFilter

      return (
        matchesSearch &&
        matchesSubject &&
        matchesType
      )
    })
  }, [
    resources,
    search,
    subjectFilter,
    typeFilter,
  ])

  return (
    <div className="academic-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <PageHeader
        eyebrow="Academic Hub"
        title="Study Resources"
        description="Find useful notes, study material and academic resources."
        backTo="/"
        actionTo="/academic/create"
        actionText="Upload Resource"
        actionIcon="+"
      />


      {/* =====================================================
          CONTENT
          ===================================================== */}

      <section className="academic-content">

        {/* SEARCH + FILTER */}
        <div className="academic-toolbar">

          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={subjectFilter}
            onChange={(event) =>
              setSubjectFilter(event.target.value)
            }
          >
            {subjects.map((subjectName) => (
              <option
                key={subjectName}
                value={subjectName}
              >
                {subjectName === 'All'
                  ? 'All Subjects'
                  : subjectName}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="All">
              All Types
            </option>

            {resourceTypeOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

        </div>


        <h2>
          Available Resources
        </h2>


        {/* LOADING */}
        {loading ? (
          <div className="no-resources">
            <h3>
              Loading resources...
            </h3>
          </div>

        ) : error ? (

          /* ERROR */
          <div className="no-resources">
            <h3>
              Unable to load resources
            </h3>

            <p>
              {error}
            </p>
          </div>

        ) : filteredResources.length > 0 ? (

          /* RESOURCE LIST */
          <div className="academic-grid">

            {filteredResources.map((resource) => (

              <article
                className="academic-card"
                key={resource._id}
              >

                {/* ICON */}
                <div className="academic-card-icon">
                  📚
                </div>


                {/* CONTENT */}
                <div className="academic-card-content">

                  <div className="academic-card-title">

                    <h3>
                      {resource.title}
                    </h3>

                    <span>
                      {getResourceTypeLabel(
                        resource.resourceType
                      )}
                    </span>

                  </div>


                  <p className="academic-subject">
                    {resource.subject}
                  </p>


                  <p className="academic-description">
                    {resource.description ||
                      'No description provided.'}
                  </p>


                  <div className="academic-card-meta">

                    <span>
                      <strong>Department:</strong>{' '}
                      {resource.department || 'N/A'}
                    </span>

                    <span>
                      <strong>Year:</strong>{' '}
                      {resource.year || 'N/A'}
                    </span>

                    <span>
                      <strong>Semester:</strong>{' '}
                      {resource.semester || 'N/A'}
                    </span>

                  </div>


                  {/* ACTIONS */}
                  <div className="academic-card-actions">

                    <Link
                      to={`/academic/${resource._id}`}
                      className="view-details-button"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      className="view-resource-button"
                      onClick={() =>
                        handleOpenResource(resource)
                      }
                    >
                      Open Resource
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        ) : (

          /* EMPTY */
          <div className="no-resources">

            <h3>
              No resources found
            </h3>

            <p>
              Try changing your search or filters.
            </p>

          </div>

        )}

      </section>

    </div>
  )
}

export default Academic