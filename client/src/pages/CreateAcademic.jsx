import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  createAcademicResource,
  uploadToCloudinary,
} from '../api'
import './CreateAcademic.css'
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

function CreateAcademic() {
  const navigate = useNavigate()

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

  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

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

      alert(
        'Academic resource added successfully!'
      )

      navigate('/academic')
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

  return (
    <div className="academic-page">




      <PageHeader
        eyebrow="CAMPUS ACADEMICS"
        title="Add Academic Resource"
        description="Share notes, previous year papers,
              and study materials."
        backTo="/academic"

      />

      <section className="academic-form-section">

        <div className="academic-form-container">

          <h2>
            Add Academic Resource
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Resource Title
              </label>

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

              <label>
                Subject
              </label>

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

              <label>
                Department
              </label>

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

              <label>
                Year
              </label>

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

              <label>
                Semester
              </label>

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

              <label>
                Resource Type
              </label>

              <select
                value={resourceType}
                onChange={(event) =>
                  setResourceType(
                    event.target.value
                  )
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
                placeholder="Describe the resource..."
              />

            </div>

            <div className="form-group">

              <label>
                Resource File
              </label>

              <div className="academic-file-upload-box">

                {filePreview ? (

                  <div className="academic-file-preview-wrapper">

                    <img
                      src={filePreview}
                      alt="Resource preview"
                      className="academic-file-preview"
                    />

                    <div className="academic-file-info">

                      <strong>
                        {fileName}
                      </strong>

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

                    <strong>
                      {fileName}
                    </strong>

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
                submitting ||
                uploadingFile
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

    </div>
  )
}

export default CreateAcademic