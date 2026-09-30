import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import {
  getAcademicResource,
  getAcademicResourceFile,
  getMe,
  deleteAcademicResource,
  saveItem,
  checkSaved,
  removeSavedItem,
} from '../api'

import BackButton from '../components/BackButton'
import UnauthorizedAccess from '../components/UnauthorizedAccess'

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

  const [authorized, setAuthorized] = useState(null)

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

      /*
       * ==========================================
       * FIRST: CHECK LOGIN
       * ==========================================
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
        setResource(null)

        return
      }


      /*
       * ==========================================
       * USER IS LOGGED IN
       * ==========================================
       */

      if (!userData?.user) {
        setAuthorized(false)

        setCurrentUser(null)
        setResource(null)

        return
      }


      setAuthorized(true)
      setCurrentUser(userData.user)


      /*
       * ==========================================
       * LOAD ACADEMIC RESOURCE
       * ==========================================
       */

      const resourceData =
        await getAcademicResource(id)

      setResource(
        resourceData.resource
      )


      /*
       * ==========================================
       * CHECK SAVED STATUS
       * ==========================================
       */

      try {
        const savedData =
          await checkSaved(
            'academic',
            id
          )

        setSaved(
          Boolean(savedData?.saved)
        )
      } catch (savedError) {
        console.error(
          'Failed to check saved status:',
          savedError
        )

        setSaved(false)
      }

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


  /*
   * ==========================================
   * OWNER CHECK
   * ==========================================
   */

  const isOwner =
    resource &&
    currentUser &&
    String(resource.uploadedBy?._id) ===
    String(currentUser._id)


  /*
   * ==========================================
   * OPEN RESOURCE
   * ==========================================
   */

  const openResource = async () => {
  try {
    const data =
      await getAcademicResourceFile(id)

    if (!data?.fileUrl) {
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


  /*
   * ==========================================
   * SAVE / UNSAVE
   * ==========================================
   */

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


  /*
   * ==========================================
   * DELETE RESOURCE
   * ==========================================
   */

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
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


  /*
   * ==========================================
   * UNAUTHORIZED
   * ==========================================
   *
   * IMPORTANT:
   * authorized === null
   * means authentication check is still running.
   *
   * authorized === false
   * means user is not logged in.
   */

  if (authorized === false) {
    return (
      <UnauthorizedAccess
        title="Login Required"
        message="You need to login to view academic resources."
        buttonText="Go to Login"
      />
    )
  }


  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading || authorized === null) {
    return (
      <div className="academic-details-page">

        <div className="academic-details-not-found">

          <h1>
            Loading...
          </h1>

        </div>

      </div>
    )
  }


  /*
   * ==========================================
   * RESOURCE NOT FOUND / ERROR
   * ==========================================
   */

  if (error || !resource) {
    return (
      <div className="academic-details-page">

        <div className="academic-details-not-found">

          <h1>
            Resource Not Found
          </h1>

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


  /*
   * ==========================================
   * MAIN PAGE
   * ==========================================
   */

  return (
    <div className="academic-details-page">

      <div className="academic-details-container">


        {/* BACK */}

        <BackButton
          label="Back to Academic Resources"
          fallback="/academic"
        />


        {/* CARD */}

        <div className="academic-details-card">

          <div className="academic-details-content">


            {/* TITLE */}

            <div className="academic-details-title-row">

              <h1>
                {resource.title}
              </h1>

              <span className="academic-details-type">
                {getResourceTypeLabel(
                  resource.resourceType
                )}
              </span>

            </div>


            {/* DESCRIPTION */}

            <p className="academic-details-description">
              {resource.description ||
                'No description provided.'}
            </p>


            {/* INFORMATION */}

            <div className="academic-details-information">


              <div className="academic-information-item">

                <span>
                  📚
                </span>

                <div>

                  <small>
                    Subject
                  </small>

                  <p>
                    {resource.subject}
                  </p>

                </div>

              </div>


              <div className="academic-information-item">

                <span>
                  🏫
                </span>

                <div>

                  <small>
                    Department
                  </small>

                  <p>
                    {resource.department}
                  </p>

                </div>

              </div>


              <div className="academic-information-item">

                <span>
                  🎓
                </span>

                <div>

                  <small>
                    Year
                  </small>

                  <p>
                    {resource.year}
                  </p>

                </div>

              </div>


              <div className="academic-information-item">

                <span>
                  📖
                </span>

                <div>

                  <small>
                    Semester
                  </small>

                  <p>
                    {resource.semester}
                  </p>

                </div>

              </div>


            </div>


            {/* UPLOADED BY */}

            <div className="academic-uploaded-by">

              <h2>
                Uploaded By
              </h2>

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


            {/* ACTIONS */}

            <div className="academic-resource-action">

              <div className="academic-resource-actions">


                {/* OPEN */}

                <button
                  type="button"
                  className="academic-open-resource-button"
                  onClick={openResource}
                >
                  Open Resource
                </button>


                {/* SAVE */}

                <button
                  type="button"
                  className={`academic-save-button ${saved
                      ? 'saved'
                      : ''
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


                {/* OWNER ACTIONS */}

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