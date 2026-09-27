import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getAcademicResource,
  getMe,
  deleteAcademicResource,
  saveItem,
  checkSaved,
  removeSavedItem,
} from '../api'
import BackButton from '../components/BackButton'
import './AcademicDetails.css'

const getResourceTypeLabel = (value) => {
  const labels = {
    'question-paper': 'Previous Year Paper',
    notes: 'Notes',
    'study-material': 'Study Material',
    assignment: 'Assignment',
    other: 'Other',
  }

  return labels[value] || value
}

function AcademicDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
const [saved, setSaved] = useState(false)
const [saving, setSaving] = useState(false)
const [error, setError] = useState('')

  useEffect(() => {
    loadResource()
  }, [id])

  const loadResource = async () => {
    try {
      setLoading(true)
      setError('')

      const [resourceData, userData] =
  await Promise.all([
    getAcademicResource(id),
    getMe(),
  ])

      setResource(resourceData.resource)
      setCurrentUser(userData.user)
      const savedData = await checkSaved(
  'academic',
  id
)

setSaved(savedData.saved)
    } catch (error) {
      console.error(
        'Failed to load academic resource:',
        error
      )

      setError(
        error.message ||
          'Failed to load academic resource'
      )
    } finally {
      setLoading(false)
    }
  }

  const isOwner =
    resource &&
    currentUser &&
    String(resource.uploadedBy?._id) ===
      String(currentUser._id)

  const openResource = () => {
    if (!resource?.fileUrl) {
      alert('No resource URL available')
      return
    }

    window.open(
      resource.fileUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleSave = async () => {
  try {
    setSaving(true)

    if (saved) {
      await removeSavedItem(
        'academic',
        id
      )

      setSaved(false)
    } else {
      await saveItem(
        'academic',
        id
      )

      setSaved(true)
    }
  } catch (error) {
    console.error(
      'Failed to update saved status:',
      error
    )

    alert(
      error.message ||
        'Failed to update saved status'
    )
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this academic resource?'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)

      await deleteAcademicResource(id)

      alert(
        'Academic resource deleted successfully'
      )

      navigate('/academic')
    } catch (error) {
      console.error(
        'Failed to delete academic resource:',
        error
      )

      alert(
        error.message ||
          'Failed to delete academic resource'
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="academic-details-page">
        <div className="academic-details-not-found">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="academic-details-page">
        <div className="academic-details-not-found">

          <h1>Resource Not Found</h1>

          <p>
            {error ||
              'This academic resource is no longer available.'}
          </p>

          <Link to="/academic">
            ← Back to Academic Resources
          </Link>

        </div>
      </div>
    )
  }

  return (
    <div className="academic-details-page">

      <div className="academic-details-container">

        <BackButton label="Back to Academic Resources" fallback="/academic" />

        <div className="academic-details-card">

          <div className="academic-details-content">

            <div className="academic-details-title-row">

              <h1>{resource.title}</h1>

              <span className="academic-details-type">
                {getResourceTypeLabel(
                  resource.resourceType
                )}
              </span>

            </div>

            <p className="academic-details-description">
              {resource.description ||
                'No description provided.'}
            </p>

            <div className="academic-details-information">

              <div className="academic-information-item">
                <span>📚</span>

                <div>
                  <small>Subject</small>
                  <p>{resource.subject}</p>
                </div>
              </div>

              <div className="academic-information-item">
                <span>🏫</span>

                <div>
                  <small>Department</small>
                  <p>{resource.department}</p>
                </div>
              </div>

              <div className="academic-information-item">
                <span>🎓</span>

                <div>
                  <small>Year</small>
                  <p>{resource.year}</p>
                </div>
              </div>

              <div className="academic-information-item">
                <span>📖</span>

                <div>
                  <small>Semester</small>
                  <p>{resource.semester}</p>
                </div>
              </div>

            </div>

            <div className="academic-uploaded-by">

              <h2>Uploaded By</h2>

              <p>
                {resource.uploadedBy?.name ||
                  'Unknown user'}
              </p>

              {resource.uploadedBy?.email && (
                <p>
                  {resource.uploadedBy.email}
                </p>
              )}

            </div>

            <div className="academic-resource-action">

  <div className="academic-resource-actions">

  <button
    type="button"
    className="academic-open-resource-button"
    onClick={openResource}
  >
    Open Resource
  </button>

  <button
    type="button"
    className={`academic-save-button ${
      saved ? 'saved' : ''
    }`}
    onClick={handleSave}
    disabled={saving}
  >
    {saving
      ? 'Saving...'
      : saved
      ? '✓ Saved'
      : '🔖 Save'}
  </button>

    {isOwner && (
      <>
        <Link
          to={`/academic/${id}/edit`}
          className="academic-edit-button"
        >
          Edit Resource
        </Link>

        <button
          type="button"
          className="academic-delete-button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting
            ? 'Deleting...'
            : 'Delete Resource'}
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

export default AcademicDetails