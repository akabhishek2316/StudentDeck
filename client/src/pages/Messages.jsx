import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import PageHeader from '../components/PageHeader'
import Navbar from '../components/Navbar'

import {
  createConversation,
  getConversations,
  getMessages,
  getMe,
  getUsers,
  markMessageAsRead,
  sendMessage,
  uploadToCloudinary,
} from '../api'

import './Messages.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const MOBILE_QUERY = '(max-width: 700px)'

function Messages() {
  const navigate = useNavigate()
  const location = useLocation()

  /* ---------- refs ---------- */
  const messageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const socketRef = useRef(null)
  const activeConversationRef = useRef(null)
  const currentUserRef = useRef(null)
  const chatMessagesRef = useRef(null)
  const conversationsRef = useRef([])
  const deliveredMessageIdsRef = useRef(new Set())
  const typingTimeoutRef = useRef(null)

  /* ---------- state ---------- */
  const [currentUser, setCurrentUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [typingUserId, setTypingUserId] = useState(null)
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches
  )

  /* =========================
   * MOBILE / DESKTOP DETECTION
   * ========================= */

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = (event) => setIsMobile(event.matches)

    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* =========================
   * KEYBOARD FIX (visualViewport)
   * Chat screen ki height = keyboard ke upar ka visible area.
   * Isse header upar hi rehta hai aur sirf messages area chhota hota hai.
   * ========================= */

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const root = document.documentElement

    const update = () => {
      root.style.setProperty('--vvh', `${vv.height}px`)
      root.style.setProperty('--vvtop', `${vv.offsetTop}px`)
      if (window.scrollY) window.scrollTo(0, 0)
    }

    const onResize = () => {
      update()
      const box = chatMessagesRef.current
      if (box) box.scrollTop = box.scrollHeight
    }

    update()
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', update)
    document.body.classList.add('messages-lock')

    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', update)
      document.body.classList.remove('messages-lock')
      root.style.removeProperty('--vvh')
      root.style.removeProperty('--vvtop')
    }
  }, [])

  /* =========================
   * KEEP REFS IN SYNC
   * ========================= */

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket?.connected || !currentUser?._id) return

    socket.emit('join_user', currentUser._id)
  }, [currentUser?._id])

  useEffect(() => {
    activeConversationRef.current = selectedConversation?._id || null
  }, [selectedConversation])

  /* =========================
   * INITIAL DATA
   * ========================= */

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    conversationsRef.current = conversations

    const socket = socketRef.current
    if (!socket?.connected) return

    conversations.forEach((conversation) => {
      if (conversation?._id) {
        socket.emit('join_conversation', conversation._id)
      }
    })
  }, [conversations])

  /* =========================
   * LOAD MESSAGES
   * ========================= */

  useEffect(() => {
    if (selectedConversation?._id) {
      loadMessages(selectedConversation._id)
    } else {
      setMessages([])
    }
  }, [selectedConversation?._id])

  /* =========================
   * NEW CHAT USERS
   * ========================= */

  useEffect(() => {
    if (!showNewChat) return
    loadUsers(userSearch)
  }, [showNewChat, userSearch])

  /* =========================
   * FILE PREVIEW CLEANUP
   * ========================= */

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview)
    }
  }, [filePreview])

  /* =========================
   * NAVBAR UNREAD COUNT
   * ========================= */

  useEffect(() => {
    const totalUnread = conversations.reduce(
      (total, conversation) => total + Number(conversation?.unreadCount || 0),
      0
    )

    localStorage.setItem('unreadMessageCount', String(totalUnread))
    window.dispatchEvent(new Event('unreadMessagesUpdated'))
  }, [conversations])

  /* =========================
   * SOCKET CONNECTION
   * ========================= */

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      const user = currentUserRef.current

      if (user?._id) {
        socket.emit('join_user', user._id)
      }

      conversationsRef.current.forEach((conversation) => {
        if (conversation?._id) {
          socket.emit('join_conversation', conversation._id)
        }
      })
    })

    socket.on('connect_error', (socketError) => {
      console.error('Socket connection error:', socketError)
    })

    /* ----- NEW MESSAGE ----- */

    socket.on('new_message', (incomingMessage) => {
      if (!incomingMessage?._id) return

      const user = currentUserRef.current
      const senderId = String(
        incomingMessage.sender?._id || incomingMessage.sender || ''
      )
      const isOwnMessage = !!user && senderId === String(user._id)

      if (!isOwnMessage) {
        socket.emit('message_delivered', {
          messageId: incomingMessage._id,
          conversationId: incomingMessage.conversation,
          senderId,
        })
      }

      const isActiveConversation =
        String(incomingMessage.conversation) ===
        String(activeConversationRef.current || '')

      /* Chat open nahi hai: unread +1 */
      if (!isActiveConversation) {
        updateConversationPreview(incomingMessage, !isOwnMessage)
        return
      }

      /* Chat open hai */
      setMessages((current) => {
        const exists = current.some(
          (message) => String(message._id) === String(incomingMessage._id)
        )
        return exists ? current : [...current, incomingMessage]
      })

      updateConversationPreview(incomingMessage, false)

      if (!isOwnMessage && !incomingMessage.read) {
        markMessageAsRead(incomingMessage._id).catch((readError) => {
          console.error('Failed to mark realtime message as read:', readError)
        })
      }
    })

    /* ----- ONLINE STATUS ----- */

    socket.on('online_users', ({ userIds }) => {
      setOnlineUsers(new Set((userIds || []).map(String)))
    })

    socket.on('user_online', ({ userId }) => {
      if (!userId) return
      setOnlineUsers((current) => new Set(current).add(String(userId)))
    })

    socket.on('user_offline', ({ userId }) => {
      if (!userId) return
      setOnlineUsers((current) => {
        const next = new Set(current)
        next.delete(String(userId))
        return next
      })
    })

    /* ----- TYPING ----- */

    socket.on('user_typing', ({ conversationId, userId }) => {
      if (String(conversationId) !== String(activeConversationRef.current)) {
        return
      }
      if (String(userId) === String(currentUserRef.current?._id)) return

      setTypingUserId(String(userId))
    })

    socket.on('user_stopped_typing', ({ conversationId }) => {
      if (String(conversationId) !== String(activeConversationRef.current)) {
        return
      }
      setTypingUserId(null)
    })

    /* ----- DELIVERED ----- */

    socket.on('message_delivered', (data) => {
      if (!data?.messageId) return

      const messageId = String(data.messageId)
      deliveredMessageIdsRef.current.add(messageId)

      setMessages((current) =>
        current.map((message) =>
          String(message._id) === messageId
            ? { ...message, delivered: true }
            : message
        )
      )
    })

    /* ----- READ ----- */

    socket.on('message_read', (readData) => {
      if (!readData?.messageId) return

      const messageId = String(readData.messageId)

      setMessages((current) =>
        current.map((message) =>
          String(message._id) === messageId
            ? { ...message, read: true }
            : message
        )
      )
    })

    return () => {
      socket.off('connect')
      socket.off('connect_error')
      socket.off('new_message')
      socket.off('message_delivered')
      socket.off('message_read')
      socket.off('online_users')
      socket.off('user_online')
      socket.off('user_offline')
      socket.off('user_typing')
      socket.off('user_stopped_typing')

      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  /* =========================
   * INITIAL LOAD
   * ========================= */

  const loadInitialData = async () => {
    try {
      setLoadingConversations(true)
      setError('')

      const [userData, conversationData] = await Promise.all([
        getMe(),
        getConversations(),
      ])

      const user = userData.user

      setCurrentUser(user)
      currentUserRef.current = user

      const loadedConversations = conversationData.conversations || []
      setConversations(loadedConversations)

      const requestedId = location.state?.conversationId

      const requestedConversation = requestedId
        ? loadedConversations.find(
          (conversation) => conversation._id === requestedId
        )
        : null

      if (requestedConversation) {
        setSelectedConversation(requestedConversation)
        navigate(location.pathname, { replace: true, state: {} })
      } else {
        setSelectedConversation(null)
        activeConversationRef.current = null
        setMessages([])
      }
    } catch (loadError) {
      console.error('Failed to load messaging data:', loadError)
      setError(loadError.message || 'Failed to load messages')
    } finally {
      setLoadingConversations(false)
    }
  }

  /* =========================
   * LOAD MESSAGES
   * ========================= */

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true)
      setError('')

      const data = await getMessages(conversationId)
      const loadedMessages = data.messages || []

      setMessages(loadedMessages)

      const user = currentUserRef.current

      for (const message of loadedMessages) {
        const isOwnMessage =
          user && String(message.sender?._id) === String(user._id)

        if (!isOwnMessage && !message.read) {
          try {
            await markMessageAsRead(message._id)
          } catch (readError) {
            console.error('Failed to mark message as read:', readError)
          }
        }
      }
    } catch (loadError) {
      console.error('Failed to load messages:', loadError)
      setError(loadError.message || 'Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  /* =========================
   * AUTO SCROLL
   * ========================= */

  const scrollToBottom = (behavior = 'smooth') => {
    const container = chatMessagesRef.current
    if (!container) return

    if (behavior === 'smooth') {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    } else {
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    if (!selectedConversation?._id) return

    requestAnimationFrame(() => scrollToBottom('smooth'))
  }, [messages, selectedConversation?._id])

  /* =========================
   * LOAD USERS
   * ========================= */

  const loadUsers = async (search) => {
    try {
      setLoadingUsers(true)
      const data = await getUsers(search)
      setUsers(data.users || [])
    } catch (loadError) {
      console.error('Failed to load users:', loadError)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  /* =========================
   * OTHER PARTICIPANT
   * ========================= */

  const getOtherParticipant = (conversation) => {
    if (
      !conversation ||
      !Array.isArray(conversation.participants) ||
      !currentUser
    ) {
      return null
    }

    return (
      conversation.participants.find(
        (participant) => String(participant?._id) !== String(currentUser._id)
      ) || null
    )
  }

  const selectedUser = useMemo(
    () => getOtherParticipant(selectedConversation),
    [selectedConversation, currentUser]
  )

  /* =========================
   * UPDATE CONVERSATION LIST
   * ========================= */

  const updateConversationPreview = (message, shouldIncrementUnread = false) => {
    if (!message?._id) return

    const conversationId = String(message.conversation)

    setConversations((current) => {
      const existing = current.find(
        (conversation) => String(conversation?._id) === conversationId
      )

      if (!existing) return current

      const currentUnread = Number(existing.unreadCount || 0)

      const lastMessage =
        message.text?.trim() ||
        message.attachment?.name ||
        (message.attachment ? 'Attachment' : '')

      const updated = {
        ...existing,
        updatedAt: message.createdAt,
        lastMessage,
        unreadCount: shouldIncrementUnread ? currentUnread + 1 : currentUnread,
      }

      const remaining = current.filter(
        (conversation) => String(conversation?._id) !== conversationId
      )

      return [updated, ...remaining]
    })
  }

  /* =========================
   * TIME FORMAT
   * ========================= */

  const formatMessageTime = (value) => {
    if (!value) return ''

    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatConversationTime = (value) => {
    if (!value) return ''

    const date = new Date(value)

    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString([], { day: '2-digit', month: 'short' })
  }

  /* =========================
   * SELECT CONVERSATION
   * ========================= */

  const handleSelectConversation = (conversation) => {
    const conversationId = String(conversation?._id)

    setConversations((current) =>
      current.map((item) =>
        String(item?._id) === conversationId ? { ...item, unreadCount: 0 } : item
      )
    )

    setSelectedConversation({ ...conversation, unreadCount: 0 })
    setNewMessage('')
    setTypingUserId(null)
    setShowNewChat(false)
    setError('')

    clearSelectedFile()
  }

  /* =========================
   * BACK TO LIST (mobile)
   * ========================= */

  const handleBackToList = () => {
    setSelectedConversation(null)
    setMessages([])
    setNewMessage('')
    setTypingUserId(null)
    setError('')
    clearSelectedFile()
  }

  /* =========================
   * START NEW CONVERSATION
   * ========================= */

  const handleStartConversation = async (userId) => {
    try {
      setError('')

      const data = await createConversation(userId)

      const newConversation = {
        ...data.conversation,
        unreadCount: 0,
        lastMessage: '',
      }

      setShowNewChat(false)
      setUserSearch('')

      setConversations((current) => {
        const alreadyExists = current.some(
          (conversation) => conversation._id === newConversation._id
        )
        return alreadyExists ? current : [newConversation, ...current]
      })

      socketRef.current?.emit('join_conversation', newConversation._id)

      setSelectedConversation(newConversation)
    } catch (startError) {
      console.error('Failed to start conversation:', startError)
      setError(startError.message || 'Failed to start conversation')
    }
  }

  /* =========================
   * FILE CHANGE / CLEAR
   * ========================= */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, and PDF files are allowed')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be 10 MB or less')
      event.target.value = ''
      return
    }

    if (filePreview) URL.revokeObjectURL(filePreview)

    setSelectedFile(file)

    setFilePreview(
      file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    )
  }

  const clearSelectedFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview)

    setSelectedFile(null)
    setFilePreview('')

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* =========================
   * TYPING EMIT
   * ========================= */

  const handleMessageChange = (event) => {
    const value = event.target.value

    setNewMessage(value)

    const socket = socketRef.current
    const user = currentUserRef.current
    const conversationId = activeConversationRef.current

    if (!socket || !user?._id || !conversationId) return

    socket.emit(value.trim() ? 'typing_start' : 'typing_stop', {
      conversationId,
      userId: user._id,
    })
  }

  /* =========================
   * SEND MESSAGE
   * Input disabled NAHI hota, isliye keyboard band nahi hota.
   * ========================= */

  const handleSendMessage = async (event) => {
    event.preventDefault()

    const messageText = newMessage.trim()
    const hasFile = !!selectedFile

    if (
      (!messageText && !hasFile) ||
      !selectedConversation ||
      sending ||
      uploading
    ) {
      return
    }

    // Current values ko API call se pehle save kar lo
    const conversationId = selectedConversation._id
    const fileToUpload = selectedFile

    try {
      setError('')

      // 🔥 Input ko immediately clear karo
      setNewMessage('')

      // File hai to loading state dikhao
      if (hasFile) {
        setSending(true)
      }

      let attachment = null

      /* =========================
         FILE UPLOAD
      ========================= */

      if (fileToUpload) {
        setUploading(true)

        const uploadResult = await uploadToCloudinary(fileToUpload)

        attachment = {
          url: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          type: fileToUpload.type.startsWith('image/')
            ? 'image'
            : 'file',
          name: fileToUpload.name,
        }

        setUploading(false)
      }

      /* =========================
         SEND MESSAGE
      ========================= */

      const data = await sendMessage(
        conversationId,
        messageText,
        attachment
      )

      const createdMessage = data.data

      /* =========================
         ADD MESSAGE TO CHAT
      ========================= */

      setMessages((current) => {
        const exists = current.some(
          (message) =>
            String(message._id) === String(createdMessage._id)
        )

        if (exists) {
          return current
        }

        const wasAlreadyDelivered =
          deliveredMessageIdsRef.current.has(
            String(createdMessage._id)
          )

        return [
          ...current,
          {
            ...createdMessage,
            delivered:
              createdMessage.delivered ||
              wasAlreadyDelivered,
          },
        ]
      })

      /* =========================
         STOP TYPING
      ========================= */

      clearTimeout(typingTimeoutRef.current)

      socketRef.current?.emit('typing_stop', {
        conversationId: activeConversationRef.current,
        userId: currentUserRef.current?._id,
      })

      /* =========================
         UPDATE CONVERSATION LIST
      ========================= */

      updateConversationPreview(createdMessage)

      /* =========================
         CLEAR ATTACHMENT
      ========================= */

      clearSelectedFile()

      /* =========================
         KEEP INPUT FOCUSED
      ========================= */

      requestAnimationFrame(() => {
        messageInputRef.current?.focus({
          preventScroll: true,
        })
      })
    } catch (sendError) {
      console.error('Failed to send message:', sendError)

      setError(
        sendError.message || 'Failed to send message'
      )
    } finally {
      setSending(false)
      setUploading(false)
    }
  }
  /* =========================
   * AVATAR HELPERS
   * ========================= */

  const getUserInitial = (user) => {
    if (!user?.name) return '?'
    return user.name.charAt(0).toUpperCase()
  }

  const renderAvatar = (user) =>
    user?.profileImage ? (
      <img
        src={user.profileImage}
        alt={user.name || 'Profile'}
        className="message-user-avatar-image"
      />
    ) : (
      getUserInitial(user)
    )

  /* =========================
   * RENDER
   * ========================= */

  const showTopChrome = !selectedConversation || !isMobile

  return (
    <div
      className={`messages-page ${selectedConversation ? 'specific-chat-page' : 'messages-list-page'
        }`}
    >
      {showTopChrome && (
        <>
          <Navbar />

          <div className="dummydiv"></div>

          <PageHeader
            eyebrow="CAMPUS COMMUNICATION"
            title="Connect. Communicate."
            description="Connect with students and communicate directly on campus."
            backTo="/"
          />
        </>
      )}

      <section
        className={`chat-container ${selectedConversation ? 'specific-chat-open' : ''
          }`}
      >
        {/* ================= CHAT LIST ================= */}

        <aside className="conversation-list">
          <div className="conversation-header">
            <div className="conversation-header-row">
              <h2>Chats</h2>

              <button
                type="button"
                className="new-chat-button"
                onClick={() => setShowNewChat((current) => !current)}
              >
                + New Chat
              </button>
            </div>

            {showNewChat && (
              <div className="new-chat-panel">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search students..."
                />

                {loadingUsers ? (
                  <p className="new-chat-status">Searching...</p>
                ) : users.length > 0 ? (
                  <div className="user-search-results">
                    {users.map((user) => (
                      <button
                        type="button"
                        className="user-search-item"
                        key={user._id}
                        onClick={() => handleStartConversation(user._id)}
                      >
                        <div className="user-search-avatar">
                          {renderAvatar(user)}
                        </div>

                        <div className="user-search-info">
                          <strong>{user.name}</strong>

                          <span>
                            {user.department || 'Campus student'}
                            {user.year ? ` • Year ${user.year}` : ''}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="new-chat-status">No students found.</p>
                )}
              </div>
            )}
          </div>

          {loadingConversations ? (
            <p className="no-conversations">Loading chats...</p>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation)

              return (
                <button
                  type="button"
                  className={
                    selectedConversation?._id === conversation._id
                      ? 'conversation active'
                      : 'conversation'
                  }
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {renderAvatar(otherUser)}
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-top">
                      <strong>{otherUser?.name || 'Campus student'}</strong>

                      <span>{formatConversationTime(conversation.updatedAt)}</span>
                    </div>

                    <div className="conversation-bottom">
                      <p>
                        {conversation.lastMessage || 'Click to open conversation'}
                      </p>

                      {Number(conversation.unreadCount || 0) > 0 && (
                        <span className="unread-badge">
                          {conversation.unreadCount > 99
                            ? '99+'
                            : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="no-conversations">No conversations yet.</p>
          )}
        </aside>

        {/* ================= CHAT WINDOW ================= */}

        <main className="chat-window">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <button
                  type="button"
                  className="mobile-chat-back"
                  onClick={handleBackToList}
                  aria-label="Back to conversations"
                >
                  ←
                </button>

                <div className="chat-avatar">{renderAvatar(selectedUser)}</div>

                <div className="chat-user-info">
                  <h2>{selectedUser?.name || 'Campus student'}</h2>

                  {typingUserId ? (
                    <span className="typing-status">typing</span>
                  ) : selectedUser?._id &&
                    onlineUsers.has(String(selectedUser._id)) ? (
                    <span className="online-status">Online</span>
                  ) : (
                    <span className="offline-status">Offline</span>
                  )}
                </div>
              </div>

              {error && <div className="messages-error">{error}</div>}

              <div className="chat-messages" ref={chatMessagesRef}>
                {loadingMessages ? (
                  <div className="empty-chat">
                    <h2>Loading messages...</h2>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwnMessage =
                      currentUser &&
                      String(message.sender?._id) === String(currentUser._id)

                    return (
                      <div
                        className={
                          isOwnMessage ? 'message-row own' : 'message-row'
                        }
                        key={message._id}
                      >
                        <div className="message-bubble">
                          {message.attachment?.url && (
                            <div className="message-attachment">
                              {message.attachment.type === 'image' ? (
                                <a
                                  href={message.attachment.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={message.attachment.url}
                                    alt={
                                      message.attachment.name ||
                                      'Message attachment'
                                    }
                                  />
                                </a>
                              ) : (
                                <a
                                  href={message.attachment.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="message-file"
                                >
                                  <span className="message-file-icon">📄</span>

                                  <span className="message-file-name">
                                    {message.attachment.name || 'Attached file'}
                                  </span>
                                </a>
                              )}
                            </div>
                          )}

                          {message.text && <p>{message.text}</p>}

                          <span className="message-meta">
                            <span className="message-time">
                              {formatMessageTime(message.createdAt)}
                            </span>

                            {isOwnMessage && (
                              <span
                                className={
                                  message.read
                                    ? 'read-receipt read'
                                    : message.delivered
                                      ? 'read-receipt delivered'
                                      : 'read-receipt'
                                }
                              >
                                {message.read || message.delivered ? '✓✓' : '✓'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="empty-chat">
                    <div className="empty-chat-icon">💬</div>

                    <h2>Start the conversation</h2>

                    <p>
                      Send the first message to{' '}
                      {selectedUser?.name || 'this student'}.
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="attachment-preview">
                  {filePreview ? (
                    <img src={filePreview} alt="Selected attachment" />
                  ) : (
                    <div className="attachment-file-preview">
                      <span>📄</span>

                      <div>
                        <strong>{selectedFile.name}</strong>

                        <small>
                          PDF •{' '}
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </small>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="remove-attachment-button"
                    onClick={clearSelectedFile}
                    disabled={sending || uploading}
                    aria-label="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              )}

              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  hidden
                />

                <button
                  type="button"
                  className="attachment-button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || uploading}
                  aria-label="Attach file"
                  title="Attach image or PDF"
                >
                  📎
                </button>

                {/* NOTE: yahan disabled nahi hai, warna keyboard band ho jata hai */}
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleMessageChange}
                  placeholder="Type a message..."
                  maxLength={2000}
                  enterKeyHint="send"
                  autoComplete="off"
                />

                <button
                  type="submit"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={
                    sending || uploading || (!newMessage.trim() && !selectedFile)
                  }
                >
                  {uploading
                    ? 'Uploading...'
                    : sending && selectedFile
                      ? 'Sending...'
                      : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">💬</div>

              <h2>Start a conversation</h2>

              <p>
                Choose an existing chat or click
                <strong> + New Chat </strong>
                to message another student.
              </p>
            </div>
          )}
        </main>
      </section>
    </div>
  )
}

export default Messages
