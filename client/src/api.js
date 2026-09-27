const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'
const getToken = () => {
  return localStorage.getItem('token')
}

const getAuthHeaders = () => {
  const token = getToken()

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

/* =========================
   AUTHENTICATION
========================= */

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data
}

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

export const getMe = async () => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user')
  }

  return data
}

export const updateProfile = async (profileData) => {
  const response = await fetch(
    `${API_URL}/api/users/profile`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update profile'
    )
  }

  return data
}

/* =========================
   MARKETPLACE
========================= */

export const getListings = async () => {
  const response = await fetch(`${API_URL}/api/marketplace`)

  if (!response.ok) {
    throw new Error('Failed to fetch marketplace listings')
  }

  return response.json()
}

export const getListing = async (id) => {
  const response = await fetch(
    `${API_URL}/api/marketplace/${id}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch listing')
  }

  return response.json()
}

export const createListing = async (listingData) => {
  const response = await fetch(
    `${API_URL}/api/marketplace`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(listingData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to create listing'
    )
  }

  return data
}

export const updateListing = async (id, listingData) => {
  const response = await fetch(
    `${API_URL}/api/marketplace/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(listingData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update listing'
    )
  }

  return data
}

export const deleteListing = async (id) => {
  const response = await fetch(
    `${API_URL}/api/marketplace/${id}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete listing')
  }

  return data
}

/* =========================
   LOST & FOUND
========================= */

export const getLostFoundPosts = async () => {
  const response = await fetch(
    `${API_URL}/api/lost-found`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch Lost & Found posts'
    )
  }

  return data
}

export const getLostFoundPost = async (id) => {
  const response = await fetch(
    `${API_URL}/api/lost-found/${id}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch Lost & Found post'
    )
  }

  return data
}

export const createLostFoundPost = async (postData) => {
  const response = await fetch(
    `${API_URL}/api/lost-found`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create Lost & Found post'
    )
  }

  return data
}

export const updateLostFoundPost = async (
  id,
  postData
) => {
  const response = await fetch(
    `${API_URL}/api/lost-found/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update Lost & Found post'
    )
  }

  return data
}

export const deleteLostFoundPost = async (id) => {
  const response = await fetch(
    `${API_URL}/api/lost-found/${id}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to delete Lost & Found post'
    )
  }

  return data
}

/* =========================
   ACADEMIC RESOURCES
========================= */

export const getAcademicResources = async () => {
  const response = await fetch(
    `${API_URL}/api/academic-resources`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch academic resources'
    )
  }

  return data
}

export const getAcademicResource = async (id) => {
  const response = await fetch(
    `${API_URL}/api/academic-resources/${id}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch academic resource'
    )
  }

  return data
}

export const createAcademicResource = async (
  resourceData
) => {
  const response = await fetch(
    `${API_URL}/api/academic-resources`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(resourceData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create academic resource'
    )
  }

  return data
}

export const updateAcademicResource = async (
  id,
  resourceData
) => {
  const response = await fetch(
    `${API_URL}/api/academic-resources/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(resourceData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update academic resource'
    )
  }

  return data
}

export const deleteAcademicResource = async (id) => {
  const response = await fetch(
    `${API_URL}/api/academic-resources/${id}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to delete academic resource'
    )
  }

  return data
}

/* =========================
   EVENTS
========================= */

export const getEvents = async () => {
  const response = await fetch(
    `${API_URL}/api/events`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch events'
    )
  }

  return data
}

export const getEvent = async (id) => {
  const response = await fetch(
    `${API_URL}/api/events/${id}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch event'
    )
  }

  return data
}

export const createEvent = async (eventData) => {
  const response = await fetch(
    `${API_URL}/api/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(eventData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to create event'
    )
  }

  return data
}

export const updateEvent = async (
  id,
  eventData
) => {
  const response = await fetch(
    `${API_URL}/api/events/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(eventData),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update event'
    )
  }

  return data
}

export const deleteEvent = async (id) => {
  const response = await fetch(
    `${API_URL}/api/events/${id}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to delete event'
    )
  }

  return data
}

/* =========================
   MESSAGES
========================= */

export const getConversations = async () => {
  const response = await fetch(
    `${API_URL}/api/messages/conversations`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch conversations'
    )
  }

  return data
}

export const createConversation = async (userId) => {
  const response = await fetch(
    `${API_URL}/api/messages/conversations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        userId,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to create conversation'
    )
  }

  return data
}

export const getMessages = async (conversationId) => {
  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch messages'
    )
  }

  return data
}

export const sendMessage = async (
  conversationId,
  text,
  attachment = null
) => {
  const payload = {
    text: typeof text === 'string' ? text.trim() : '',
  }

  // Attachment tabhi bhejo jab actual attachment ho
  if (attachment) {
    payload.attachment = attachment
  }

  const response = await fetch(
    `${API_URL}/api/messages/conversations/${conversationId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to send message'
    )
  }

  return data
}

export const markMessageAsRead = async (
  messageId
) => {
  const response = await fetch(
    `${API_URL}/api/messages/${messageId}/read`,
    {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to mark message as read'
    )
  }

  return data
}

export const getUsers = async (search = '') => {
  const response = await fetch(
    `${API_URL}/api/users?search=${encodeURIComponent(search)}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch users'
    )
  }

  return data
}

/* =========================
   SAVED ITEMS
========================= */

export const saveItem = async (
  itemType,
  itemId
) => {
  const response = await fetch(
    `${API_URL}/api/saves`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        itemType,
        itemId,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to save item'
    )
  }

  return data
}

export const getSavedItems = async () => {
  const response = await fetch(
    `${API_URL}/api/saves`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch saved items'
    )
  }

  return data
}

export const checkSaved = async (
  itemType,
  itemId
) => {
  const response = await fetch(
    `${API_URL}/api/saves/check/${itemType}/${itemId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to check saved item'
    )
  }

  return data
}

export const removeSavedItem = async (
  itemType,
  itemId
) => {
  const response = await fetch(
    `${API_URL}/api/saves/${itemType}/${itemId}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to remove saved item'
    )
  }

  return data
}

export const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error('Please select a file')
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Only JPG, PNG, WEBP, and PDF files are allowed'
    )
  }

  const maxSize = 10 * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error(
      'File size must be 10 MB or less'
    )
  }

  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

  const uploadPreset =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration is missing'
    )
  }

  const formData = new FormData()

  formData.append('file', file)
  formData.append(
    'upload_preset',
    uploadPreset
  )

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        'Cloudinary upload failed'
    )
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    originalFilename:
      data.original_filename || file.name,
  }
}