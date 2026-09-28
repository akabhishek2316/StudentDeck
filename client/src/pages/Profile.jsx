import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import {
  getMe,
  updateProfile,
  uploadToCloudinary,
} from '../api'
import './Profile.css'

function Profile() {
  const [isEditing, setIsEditing] = useState(false)

  // Saved profile data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [hostel, setHostel] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] =
    useState(null)
  const [profileImagePublicId, setProfileImagePublicId] =
    useState('')

  // Temporary editing data
  const [editName, setEditName] = useState('')
  const [editDepartment, setEditDepartment] =
    useState('')
  const [editYear, setEditYear] = useState('')
  const [editHostel, setEditHostel] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editProfileImage, setEditProfileImage] =
    useState(null)
  const [editProfileImagePublicId, setEditProfileImagePublicId] =
    useState('')

  // Profile image upload state
  const [selectedImage, setSelectedImage] =
    useState(null)
  const [uploadingImage, setUploadingImage] =
    useState(false)
  const [savingProfile, setSavingProfile] =
    useState(false)

  // Cropper state
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  })

  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState(null)

  const [showCropper, setShowCropper] =
    useState(false)

  const [cropImage, setCropImage] =
    useState(null)

  useEffect(() => {
    loadProfile()
  }, [])

  // =========================================
  // Create cropped image
  // =========================================

  const createCroppedImage = async (
    imageSrc,
    pixelCrop
  ) => {
    const image = new Image()

    image.src = imageSrc

    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
    })

    const canvas =
      document.createElement('canvas')

    const context = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    context.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                'Failed to create cropped image'
              )
            )
            return
          }

          const file = new File(
            [blob],
            'profile-image.jpg',
            {
              type: 'image/jpeg',
            }
          )

          resolve(file)
        },
        'image/jpeg',
        0.92
      )
    })
  }

  // =========================================
  // Load profile
  // =========================================

  const loadProfile = async () => {
    try {
      const data = await getMe()
      const user = data.user

      const yearLabels = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year',
      }

      setName(user.name || '')
      setEmail(user.email || '')
      setDepartment(user.department || '')
      setYear(yearLabels[user.year] || '')
      setProfileImage(
        user.profileImage || null
      )
      setProfileImagePublicId(
        user.profileImagePublicId || ''
      )

      const extraProfile = JSON.parse(
        localStorage.getItem(
          'studentExtraProfile'
        ) || 'null'
      )

      if (extraProfile) {
        setHostel(extraProfile.hostel || '')
        setBio(extraProfile.bio || '')
      }
    } catch (error) {
      console.error(
        'Failed to load profile:',
        error
      )
    }
  }

  // =========================================
  // Start editing
  // =========================================

  const startEditing = () => {
    setEditName(name)
    setEditDepartment(department)
    setEditYear(year)
    setEditHostel(hostel)
    setEditBio(bio)

    setEditProfileImage(profileImage)

    setEditProfileImagePublicId(
      profileImagePublicId
    )

    setSelectedImage(null)

    setIsEditing(true)
  }

  // =========================================
  // Select profile image
  // =========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Please select a JPG, PNG, or WEBP image'
      )

      event.target.value = ''
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      alert(
        'Profile image must be 5 MB or less'
      )

      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setCropImage(reader.result)

      setCrop({
        x: 0,
        y: 0,
      })

      setZoom(1)

      setCroppedAreaPixels(null)

      setShowCropper(true)
    }

    reader.onerror = () => {
      alert('Failed to read image')
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  // =========================================
  // Crop complete
  // =========================================

  const handleCropComplete = (
    _croppedArea,
    croppedAreaPixelsValue
  ) => {
    setCroppedAreaPixels(
      croppedAreaPixelsValue
    )
  }

  // =========================================
  // Confirm crop
  // =========================================

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels) {
      return
    }

    try {
      const croppedFile =
        await createCroppedImage(
          cropImage,
          croppedAreaPixels
        )

      const previewUrl =
        URL.createObjectURL(croppedFile)

      setSelectedImage(croppedFile)

      setEditProfileImage(previewUrl)

      setShowCropper(false)

      setCropImage(null)
    } catch (error) {
      console.error(
        'Crop image error:',
        error
      )

      alert('Failed to crop image')
    }
  }

  // =========================================
  // Cancel crop
  // =========================================

  const handleCropCancel = () => {
    setShowCropper(false)

    setCropImage(null)

    setCrop({
      x: 0,
      y: 0,
    })

    setZoom(1)
  }

  // =========================================
  // Keep existing photo
  // =========================================

  const handleRestoreExistingImage = () => {
  setSelectedImage(null)

  setEditProfileImage(profileImage)

  setEditProfileImagePublicId(
    profileImagePublicId
  )
}

const handleRemoveProfileImage = () => {
  setSelectedImage(null)
  setEditProfileImage(null)
  setEditProfileImagePublicId('')
}
  // =========================================
  // Save profile
  // =========================================

  const handleSave = async (event) => {
    event.preventDefault()

    if (!editName.trim()) {
      alert('Please enter your name')
      return
    }

    if (!editDepartment.trim()) {
      alert('Please enter your department')
      return
    }

    if (!editYear) {
      alert('Please select your year')
      return
    }

    try {
      setSavingProfile(true)

      const numericYear = Number(
        editYear.replace(/\D/g, '')
      )

      let finalProfileImage =
        editProfileImage || ''

      let finalProfileImagePublicId =
        editProfileImagePublicId || ''

      // Upload cropped image to Cloudinary
      if (selectedImage) {
        setUploadingImage(true)

        const uploadResult =
          await uploadToCloudinary(
            selectedImage
          )

        finalProfileImage =
          uploadResult.secureUrl

        finalProfileImagePublicId =
          uploadResult.publicId

        setUploadingImage(false)
      }

      const data = await updateProfile({
        name: editName.trim(),
        department: editDepartment.trim(),
        year: numericYear,
        profileImage: finalProfileImage,
        profileImagePublicId:
          finalProfileImagePublicId,
      })

      const updatedUser = data.user

      const yearLabels = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year',
      }

      setName(updatedUser.name || '')
      setEmail(updatedUser.email || '')
      setDepartment(
        updatedUser.department || ''
      )

      setYear(
        yearLabels[updatedUser.year] || ''
      )

      setProfileImage(
        updatedUser.profileImage || null
      )

      setProfileImagePublicId(
        updatedUser.profileImagePublicId || ''
      )

      setHostel(editHostel.trim())
      setBio(editBio.trim())

      localStorage.setItem(
        'studentExtraProfile',
        JSON.stringify({
          hostel: editHostel.trim(),
          bio: editBio.trim(),
        })
      )

      localStorage.setItem(
        'currentUser',
        JSON.stringify(updatedUser)
      )

      window.dispatchEvent(new Event('profileUpdated'))

      setSelectedImage(null)

      setIsEditing(false)

      alert('Profile updated successfully!')
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      )

      alert(
        error.message ||
          'Failed to update profile'
      )
    } finally {
      setUploadingImage(false)
      setSavingProfile(false)
    }
  }

  // =========================================
  // Cancel profile editing
  // =========================================

  const handleCancel = () => {
  setSelectedImage(null)

  setEditProfileImage(profileImage)

  setEditProfileImagePublicId(
    profileImagePublicId
  )

  setCropImage(null)
  setShowCropper(false)

  setCrop({
    x: 0,
    y: 0,
  })

  setZoom(1)

  setIsEditing(false)
}

  return (
    <div className="profile-page">

      {/* =========================================
          PROFILE PHOTO CROP MODAL
      ========================================= */}

      {showCropper && (
        <div className="crop-modal-overlay">

          <div className="crop-modal">

            <div className="crop-modal-header">

              <div>
                <h2>
                  Adjust Profile Photo
                </h2>

                <p>
                  Drag the photo and zoom to
                  choose exactly what you want
                  to show.
                </p>
              </div>

              <button
                type="button"
                className="crop-close-button"
                onClick={
                  handleCropCancel
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="crop-container">

              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={
                  handleCropComplete
                }
              />

            </div>

            <div className="crop-controls">

              <label htmlFor="profile-zoom">
                Zoom
              </label>

              <input
                id="profile-zoom"
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target.value
                    )
                  )
                }
              />

              <span>
                {zoom.toFixed(1)}×
              </span>

            </div>

            <div className="crop-modal-actions">

              <button
                type="button"
                className="crop-cancel-button"
                onClick={
                  handleCropCancel
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="crop-confirm-button"
                onClick={
                  handleCropConfirm
                }
              >
                Crop Photo
              </button>

            </div>

          </div>

        </div>
      )}

      <div className="profile-container">

        {/* ================= HEADER ================= */}

   {/* ================= PROFILE HEADER ================= */}

<section className="profile-header">

  {/* BACK BUTTON */}
  <button
    type="button"
    className="profile-back-button"
    onClick={() => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }}
    aria-label="Go back"
  >
    <span>←</span>
    <span>Back</span>
  </button>

  {/* HEADER CONTENT */}
  <div className="profile-header-content">

    {/* PROFILE PHOTO */}
    <div className="profile-avatar-wrapper">

      <div className="profile-avatar">

        {profileImage ? (
          <img
            src={profileImage}
            alt={`${name || 'Student'} profile`}
          />
        ) : (
          <span className="profile-avatar-placeholder">
            {name
              ? name.charAt(0).toUpperCase()
              : 'S'}
          </span>
        )}

      </div>

      <div className="profile-avatar-status">
        <span></span>
      </div>

    </div>

    <div className="profile-eyebrow">
      <span className="profile-eyebrow-dot"></span>
      STUDENT PROFILE
    </div>

    <h1>
      {name || 'Student'} <span>Profile.</span>
    </h1>

    <p>
      Manage your profile, academic information,
      and personal details.
    </p>

  </div>

  {/* EDIT BUTTON */}
  <div className="profile-header-action">

    {!isEditing && (
      <button
        type="button"
        className="edit-profile-button"
        onClick={startEditing}
      >
        Edit Profile
      </button>
    )}

  </div>

</section>
        {/* ================= EDIT FORM ================= */}

        {isEditing ? (

          <form
            className="profile-form"
            onSubmit={handleSave}
          >

         {/* ================= PROFILE PHOTO ================= */}

<div className="profile-photo-editor">

  {/* PHOTO PREVIEW */}
  <div className="profile-photo-editor-preview">

    <div className="profile-edit-avatar">

      {editProfileImage ? (
        <img
          src={editProfileImage}
          alt="Profile preview"
        />
      ) : (
        <span>
          {editName
            ? editName.charAt(0).toUpperCase()
            : 'S'}
        </span>
      )}

    </div>

  </div>

  {/* PHOTO CONTENT */}
<div className="profile-photo-editor-content">

  <div className="profile-photo-editor-heading">
    <h3>Profile Photo</h3>

    <p>
      Add a clear photo so other students
      can recognize you.
    </p>
  </div>

  <div className="profile-image-actions">

    {/* ADD PHOTO BUTTON */}
    <label
      htmlFor="profile-image-upload"
      className="photo-upload"
    >
      <span>＋</span>
      Add Photo
    </label>

    <input
      id="profile-image-upload"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleImageChange}
      hidden
    />

    {/* REMOVE PHOTO BUTTON */}
    {editProfileImage && (
      <button
        type="button"
        className="remove-photo-button"
        onClick={handleRemoveProfileImage}
      >
        <span>×</span>
        Remove Photo
      </button>
    )}

  </div>

  <span className="profile-photo-hint">
    JPG, PNG or WEBP • Max 5 MB • Square photo recommended
  </span>

</div>

</div>

            <div className="profile-form-grid">

              {/* NAME */}

              <div className="form-group">

                <label>Name</label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your name"
                />

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  value={email}
                  disabled
                />

              </div>

              {/* DEPARTMENT */}

              <div className="form-group">

                <label>Department</label>

                <input
                  type="text"
                  value={editDepartment}
                  onChange={(event) =>
                    setEditDepartment(
                      event.target.value
                    )
                  }
                  placeholder="Example: ECE"
                />

              </div>

              {/* YEAR */}

              <div className="form-group">

                <label>Year</label>

                <select
                  className="year-select"
                  value={editYear}
                  onChange={(event) =>
                    setEditYear(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select year
                  </option>

                  <option value="1st Year">
                    1st Year
                  </option>

                  <option value="2nd Year">
                    2nd Year
                  </option>

                  <option value="3rd Year">
                    3rd Year
                  </option>

                  <option value="4th Year">
                    4th Year
                  </option>

                </select>

              </div>

              {/* HOSTEL */}

              <div className="form-group">

                <label>Hostel</label>

                <input
                  type="text"
                  value={editHostel}
                  onChange={(event) =>
                    setEditHostel(
                      event.target.value
                    )
                  }
                  placeholder="Example: Hostel 5"
                />

              </div>

              {/* BIO */}

              <div className="form-group full-width">

                <label>Bio</label>

                <textarea
                  value={editBio}
                  onChange={(event) =>
                    setEditBio(
                      event.target.value
                    )
                  }
                  placeholder="Tell other students something about yourself..."
                />

              </div>

            </div>

            <div className="profile-actions">

              <button
                type="submit"
                className="save-profile-button"
                disabled={
                  savingProfile ||
                  uploadingImage
                }
              >

                {uploadingImage
                  ? 'Uploading Photo...'
                  : savingProfile
                    ? 'Saving...'
                    : 'Save Profile'}

              </button>

              <button
                type="button"
                className="cancel-profile-button"
                onClick={handleCancel}
                disabled={
                  savingProfile ||
                  uploadingImage
                }
              >
                Cancel
              </button>

            </div>

          </form>

        ) : (

          /* ================= PROFILE INFORMATION ================= */

          <div className="profile-information">

            <div className="profile-info-card">

              <span>📧</span>

              <div>

                <small>Email</small>

                <p>
                  {email || 'Not added'}
                </p>

              </div>

            </div>

            <div className="profile-info-card">

              <span>🎓</span>

              <div>

                <small>Department</small>

                <p>
                  {department ||
                    'Not added'}
                </p>

              </div>

            </div>

            <div className="profile-info-card">

              <span>📚</span>

              <div>

                <small>Year</small>

                <p>
                  {year || 'Not added'}
                </p>

              </div>

            </div>

            <div className="profile-info-card">

              <span>🏠</span>

              <div>

                <small>Hostel</small>

                <p>
                  {hostel || 'Not added'}
                </p>

              </div>

            </div>

            <div className="profile-bio">

              <h2>About Me</h2>

              <p>
                {bio ||
                  'No bio added yet. Click Edit Profile to add one.'}
              </p>

            </div>

          </div>

        )}

        <Link
          to="/"
          className="back-home-link"
        >
          ← Back to Home
        </Link>

      </div>

    </div>
  )
}

export default Profile