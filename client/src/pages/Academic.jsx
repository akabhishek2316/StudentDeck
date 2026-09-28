import { Link ,useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  getAcademicResources,
  createAcademicResource,
  uploadToCloudinary,
} from '../api'
import './Academic.css'

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

  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [resourceType, setResourceType] = useState('')

  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [fileName, setFileName] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResources()
  }, [])

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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Please select a PDF, JPG, PNG, or WEBP file'
      )

      event.target.value = ''
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      alert('File size must be 10 MB or less')

      event.target.value = ''
      return
    }

    setSelectedFile(file)
    setFileName(file.name)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()

      reader.onload = () => {
        setFilePreview(reader.result)
      }

      reader.onerror = () => {
        setFilePreview('')
        alert('Failed to preview image')
      }

      reader.readAsDataURL(file)
    } else {
      setFilePreview('')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview('')
    setFileName('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      alert('Please enter a resource title')
      return
    }

    if (!subject.trim()) {
      alert('Please enter a subject')
      return
    }

    if (!department.trim()) {
      alert('Please enter a department')
      return
    }

    if (!year) {
      alert('Please select a year')
      return
    }

    if (!semester) {
      alert('Please select a semester')
      return
    }

    if (!resourceType) {
      alert('Please select a resource type')
      return
    }

    if (!selectedFile) {
      alert('Please select a resource file')
      return
    }

    try {
      setSubmitting(true)
      setUploadingFile(true)

      const uploadResult =
        await uploadToCloudinary(selectedFile)

      setUploadingFile(false)

      await createAcademicResource({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        department: department.trim(),
        year: Number(year),
        semester: Number(semester),
        resourceType,
        fileUrl: uploadResult.secureUrl,
        filePublicId: uploadResult.publicId,
      })

      alert('Academic resource added successfully!')

      setTitle('')
      setDescription('')
      setSubject('')
      setDepartment('')
      setYear('')
      setSemester('')
      setResourceType('')
      setSelectedFile(null)
      setFilePreview('')
      setFileName('')
      setShowForm(false)

      await loadResources()
    } catch (error) {
      console.error(
        'Create academic resource error:',
        error
      )

      alert(
        error.message ||
          'Failed to create academic resource'
      )
    } finally {
      setUploadingFile(false)
      setSubmitting(false)
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

  const filteredResources = resources.filter(
    (resource) => {
      const searchText = search.toLowerCase()

      const title =
        resource.title?.toLowerCase() || ''

      const subject =
        resource.subject?.toLowerCase() || ''

      const description =
        resource.description?.toLowerCase() || ''

      const department =
        resource.department?.toLowerCase() || ''

      const matchesSearch =
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
    }
  )

  const openResource = (fileUrl) => {
  if (!fileUrl) {
    alert('No resource file available')
    return
  }

  window.location.href = fileUrl
}

  return (
    <div className="academic-page">
      <section className="academic-header">

  <div className="academic-header-inner">

    {/* LEFT — BACK */}
    <button
      type="button"
      className="academic-back-button"
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
    <div className="academic-header-center">

      <span className="academic-eyebrow">
        CAMPUS ACADEMICS
      </span>

      <h1>
        Academic Resources
      </h1>

      <p>
        Share and access notes, previous year papers,
        and study materials.
      </p>

    </div>


    {/* RIGHT — ADD RESOURCE */}
    <button
      type="button"
      className="add-resource-button"
      onClick={() =>
        setShowForm((current) => !current)
      }
    >
      {showForm
        ? 'Close Form'
        : 'Add Resource'}
    </button>

  </div>

</section>

      {showForm && (
        <section className="academic-form-section">
          <div className="academic-form-container">
            <h2>Add Academic Resource</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Resource Title</label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Example: DBMS Notes"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="Example: DBMS"
                />
              </div>

              <div className="form-group">
                <label>Department</label>

                <input
                  type="text"
                  value={department}
                  onChange={(event) =>
                    setDepartment(event.target.value)
                  }
                  placeholder="Example: ECE"
                />
              </div>

              <div className="form-group">
                <label>Year</label>

                <select
                  value={year}
                  onChange={(event) =>
                    setYear(event.target.value)
                  }
                >
                  <option value="">
                    Select year
                  </option>

                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Semester</label>

                <select
                  value={semester}
                  onChange={(event) =>
                    setSemester(event.target.value)
                  }
                >
                  <option value="">
                    Select semester
                  </option>

                  {Array.from(
                    { length: 8 },
                    (_, index) => (
                      <option
                        key={index + 1}
                        value={index + 1}
                      >
                        Semester {index + 1}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Resource Type</label>

                <select
                  value={resourceType}
                  onChange={(event) =>
                    setResourceType(event.target.value)
                  }
                >
                  <option value="">
                    Select resource type
                  </option>

                  {resourceTypeOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the resource..."
                />
              </div>

              <div className="form-group">
                <label>Resource File</label>

                <div className="academic-file-upload-box">
                  {filePreview ? (
                    <div className="academic-file-preview-wrapper">
                      <img
                        src={filePreview}
                        alt="Resource preview"
                        className="academic-file-preview"
                      />

                      <div className="academic-file-info">
                        <strong>{fileName}</strong>

                        <div className="academic-file-actions">
                          <label className="academic-file-change-button">
                            Replace File

                            <input
                              type="file"
                              accept=".pdf,image/jpeg,image/png,image/webp"
                              onChange={handleFileChange}
                            />
                          </label>

                          <button
                            type="button"
                            className="academic-file-remove-button"
                            onClick={handleRemoveFile}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <div className="academic-selected-file">
                      <div className="academic-file-icon">
                        📄
                      </div>

                      <strong>{fileName}</strong>

                      <span>
                        PDF document selected
                      </span>

                      <div className="academic-file-actions">
                        <label className="academic-file-change-button">
                          Replace File

                          <input
                            type="file"
                            accept=".pdf,image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                          />
                        </label>

                        <button
                          type="button"
                          className="academic-file-remove-button"
                          onClick={handleRemoveFile}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="academic-upload-icon">
                        📚
                      </div>

                      <h3>
                        Upload Academic Resource
                      </h3>

                      <p>
                        Choose a PDF, JPG, PNG, or WEBP
                        file
                      </p>

                      <span>
                        Maximum file size: 10 MB
                      </span>

                      <label className="academic-file-select-button">
                        Choose File

                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              <button
                className="submit-resource-button"
                type="submit"
                disabled={
                  submitting || uploadingFile
                }
              >
                {uploadingFile
                  ? 'Uploading file...'
                  : submitting
                    ? 'Adding...'
                    : 'Add Resource'}
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="academic-content">
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

            {resourceTypeOptions.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </div>

        <h2>Available Resources</h2>

        {loading ? (
          <div className="no-resources">
            <h3>Loading resources...</h3>
          </div>
        ) : error ? (
          <div className="no-resources">
            <h3>Unable to load resources</h3>
            <p>{error}</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="academic-grid">
            {filteredResources.map(
              (resource) => (
                <div
                  className="academic-card"
                  key={resource._id}
                >
                  <div className="academic-card-icon">
                    📚
                  </div>

                  <div className="academic-card-content">
                    <div className="academic-card-title">
                      <h3>{resource.title}</h3>

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

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        color: '#475569',
                        fontSize: '14px',
                        marginTop: '10px',
                      }}
                    >
                      <span>
                        Department:{' '}
                        {resource.department}
                      </span>

                      <span>
                        Year: {resource.year}
                      </span>

                      <span>
                        Semester:{' '}
                        {resource.semester}
                      </span>
                    </div>

                    <div className="academic-card-actions">
                      <Link
                        to={`/academic/${resource._id}`}
                        className="view-details-button"
                      >
                        View Details
                      </Link>

                      {resource.fileUrl ? (
  <a
    href={resource.fileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="view-resource-button"
  >
    Open Resource
  </a>
) : (
  <button
    type="button"
    className="view-resource-button"
    disabled
  >
    Resource Unavailable
  </button>
)}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="no-resources">
            <h3>No resources found</h3>

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