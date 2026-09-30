import './Navbar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

function Navbar() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  )

  useEffect(() => {
    const syncUser = () => {
      const user = JSON.parse(
        localStorage.getItem('currentUser') || 'null'
      )

      setCurrentUser(user)
    }

    window.addEventListener('profileUpdated', syncUser)
    window.addEventListener('storage', syncUser)

    return () => {
      window.removeEventListener('profileUpdated', syncUser)
      window.removeEventListener('storage', syncUser)
    }
  }, [])


  useEffect(() => {
    if (!currentUser?._id) {
      setNotifications([]);
      setNotificationUnreadCount(0);
      return;
    }

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL

    const socket = io(SOCKET_URL, {
      transports: [
        "websocket",
        "polling"
      ]
    });

    const loadNotifications =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          const response =
            await fetch(
              `${SOCKET_URL}/api/notifications`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );

          if (!response.ok) {
            throw new Error(
              "Failed to load notifications"
            );
          }

          const data =
            await response.json();

          setNotifications(
            data.notifications || []
          );

          setNotificationUnreadCount(
            Number(
              data.unreadCount || 0
            )
          );
        } catch (error) {
          console.error(
            "Notification load error:",
            error
          );
        }
      };

    socket.on("connect", () => {
      socket.emit(
        "join_user",
        currentUser._id
      );
    });

    socket.on(
      "new_notification",
      (notification) => {
        if (!notification?._id) {
          return;
        }

        setNotifications(
          (current) => [
            notification,
            ...current
          ].slice(0, 50)
        );

        setNotificationUnreadCount(
          (current) =>
            current + 1
        );
      }
    );

    loadNotifications();

    return () => {
      socket.off(
        "new_notification"
      );

      socket.disconnect();
    };
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) return

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('join_user', currentUser._id)
    })

    socket.on('new_message', (message) => {
      if (!message?._id) return

      const senderId =
        message.sender?._id ||
        message.sender

      // Apne khud ke message ko unread count mein mat add karo
      if (
        String(senderId) ===
        String(currentUser._id)
      ) {
        return
      }

      const currentCount = Number(
        localStorage.getItem('unreadMessageCount') || 0
      )

      const newCount = currentCount + 1

      localStorage.setItem(
        'unreadMessageCount',
        String(newCount)
      )

      setUnreadMessageCount(newCount)

      window.dispatchEvent(
        new Event('unreadMessagesUpdated')
      )
    })

    return () => {
      socket.off('new_message')
      socket.disconnect()
    }
  }, [currentUser?._id])

  const [showMenu, setShowMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const [unreadMessageCount, setUnreadMessageCount] = useState(
    Number(localStorage.getItem('unreadMessageCount') || 0))

  const [notifications, setNotifications] =
    useState([]);

  const [notificationUnreadCount, setNotificationUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const navbarRef = useRef(null)
  const menuRef = useRef(null)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)


  useEffect(() => {
    const syncUnreadMessages = () => {
      setUnreadMessageCount(
        Number(localStorage.getItem('unreadMessageCount') || 0)
      )
    }

    window.addEventListener('unreadMessagesUpdated', syncUnreadMessages)

    return () => {
      window.removeEventListener(
        'unreadMessagesUpdated',
        syncUnreadMessages
      )
    }
  }, [])


  useEffect(() => {
    const handleOutsideClick = (event) => {
      const target = event.target

      const clickedInsideMenu =
        menuRef.current?.contains(target)

      const clickedInsideNotification =
        notificationRef.current?.contains(target)

      const clickedInsideProfile =
        profileRef.current?.contains(target)

      const clickedHamburger =
        target.closest('.hamburger-button')

      if (clickedHamburger) {
        return
      }

      if (
        !clickedInsideMenu &&
        !clickedInsideNotification &&
        !clickedInsideProfile
      ) {
        setShowMenu(false)
        setShowNotifications(false)
        setShowProfileMenu(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
    }
  }, [])


  //notification

  const handleNotificationClick = async (notification) => {
    try {
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL

      const token =
        localStorage.getItem('token')

      const wasUnread =
        !notification.read

      const response = await fetch(
        `${SOCKET_URL}/api/notifications/${notification._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to delete notification'
        )
      }

      const data = await response.json()

      /*
       * Remove notification from dropdown
       */
      setNotifications((current) =>
        current.filter(
          (item) =>
            item._id !== notification._id
        )
      )

      /*
       * Update unread count only if
       * notification was unread
       */
      if (wasUnread) {
        setNotificationUnreadCount(
          (current) =>
            Math.max(0, current - 1)
        )
      }

      /*
       * Close notification dropdown
       */
      setShowNotifications(false)

      /*
       * Navigate to notification page
       */
      if (notification.link) {
        navigate(notification.link)
      }
    } catch (error) {
      console.error(
        'Notification delete error:',
        error
      )

      /*
       * Agar delete fail ho jaye,
       * notification ko remove mat karo.
       *
       * Lekin user ko requested page par
       * navigate kar sakte hain.
       */
      setShowNotifications(false)

      if (notification.link) {
        navigate(notification.link)
      }
    }
  }
  const handleMarkAllNotificationsRead = async () => {
    try {
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL

      const token = localStorage.getItem('token')

      const response = await fetch(
        `${SOCKET_URL}/api/notifications/read-all`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to clear notifications')
      }

      const data = await response.json()

      // Database se delete hone ke baad UI bhi empty karo
      setNotifications([])
      setNotificationUnreadCount(0)

      console.log(
        `Deleted ${data.deletedCount || 0} notifications`
      )
    } catch (error) {
      console.error(
        'Clear all notifications error:',
        error
      )
    }
  }

  const formatNotificationTime =
    (date) => {
      if (!date) return "";

      const now = new Date();
      const created =
        new Date(date);

      const diff =
        Math.floor(
          (now - created) / 1000
        );

      if (diff < 60) {
        return "Just now";
      }

      if (diff < 3600) {
        return `${Math.floor(
          diff / 60
        )} min ago`;
      }

      if (diff < 86400) {
        return `${Math.floor(
          diff / 3600
        )} hr ago`;
      }

      if (diff < 604800) {
        return `${Math.floor(
          diff / 86400
        )} days ago`;
      }

      return created.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short"
        }
      );
    };


  const handleLogout = () => {
    localStorage.removeItem('currentUser')

    setCurrentUser(null)
    setShowMenu(false)
    setShowProfileMenu(false)

    navigate('/')
  }

  const closeMenu = () => {
    setShowMenu(false)
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link'

  return (
    <nav className="navbar">

      {/* ================= LEFT SIDE ================= */}
      <div className="navbar-left">

        {/* HAMBURGER */}
        <button
          className="hamburger-button"
          onClick={() => {
            setShowMenu(prev => !prev)
            setShowNotifications(false)
            setShowProfileMenu(false)
          }}
          aria-label="Open navigation menu"
          aria-expanded={showMenu}
        >
          {showMenu ? '✕' : '☰'}
        </button>

        {/* LOGO */}
        <NavLink
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          StudentDeck
        </NavLink>

      </div>


      {/* ================= MAIN NAV ================= */}
      <div className="navbar-links">

        <NavLink
          to="/messages"
          className={linkClass}
        >
          <span className="navbar-message-link">
            <span className="navbar-message-text">
              Messages
            </span>

            <span className="navbar-message-icon">
              💬
            </span>

            {unreadMessageCount > 0 && (
              <span className="navbar-message-badge">
                {unreadMessageCount > 99
                  ? '99+'
                  : unreadMessageCount}
              </span>
            )}
          </span>
        </NavLink>

        <div
          ref={notificationRef}
          className="navbar-notification-wrapper"
        >
          <button
            type="button"
            className="navbar-notification-button"
            onClick={() => {
              setShowNotifications(prev => !prev)
              setShowMenu(false)
              setShowProfileMenu(false)
            }}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <span className="navbar-bell-icon">
              🔔
            </span>

            {notificationUnreadCount > 0 && (
              <span className="navbar-notification-badge">
                {notificationUnreadCount > 99
                  ? "99+"
                  : notificationUnreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="navbar-notification-dropdown">

              <div className="notification-dropdown-header">
                <div>
                  <strong>
                    Notifications
                  </strong>

                  {notificationUnreadCount > 0 && (
                    <span>
                      {notificationUnreadCount} unread
                    </span>
                  )}
                </div>

                {notificationUnreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotificationsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notification-list">

                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <div>
                      🔔
                    </div>

                    <strong>
                      No notifications
                    </strong>

                    <span>
                      You're all caught up.
                    </span>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        className={`notification-item ${notification.read
                            ? ""
                            : "notification-item-unread"
                          }`}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >
                        <span
                          className={`notification-type-icon notification-${notification.type}`}
                        >
                          {notification.type ===
                            "marketplace"
                            ? "🛒"
                            : notification.type ===
                              "lost-found"
                              ? "🔎"
                              : notification.type ===
                                "academic"
                                ? "📚"
                                : "📅"}
                        </span>

                        <span className="notification-content">
                          <strong>
                            {notification.title}
                          </strong>

                          <span>
                            {notification.message}
                          </span>

                          <small>
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </small>
                        </span>

                        {!notification.read && (
                          <span className="notification-unread-dot" />
                        )}
                      </button>
                    )
                  )
                )}

              </div>
            </div>
          )}
        </div>

        {/* <NavLink
          to="/saved"
          className={linkClass}
        >
          Saved
        </NavLink> */}


        {/* ================= PROFILE ================= */}
        {currentUser ? (

          <div
            ref={profileRef}
            className="profile-menu"
          >

            <button
              className="profile-trigger"
              onClick={() => {
                setShowProfileMenu(prev => !prev)
                setShowMenu(false)
                setShowNotifications(false)
              }}
            >

              <span className="navbar-profile-avatar">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt="Profile"
                    className="navbar-profile-avatar-image"
                  />
                ) : (
                  <span className="navbar-profile-avatar-initial">
                    {currentUser.name
                      ? currentUser.name.charAt(0).toUpperCase()
                      : 'U'}
                  </span>
                )}
              </span>

              <span className="profile-name">
                Profile
              </span>

              <span className="profile-arrow">
                {showProfileMenu ? '▲' : '▼'}
              </span>

            </button>


            {showProfileMenu && (

              <div className="profile-dropdown">

                <NavLink
                  to="/profile"
                  className="dropdown-item"
                  onClick={() =>
                    setShowProfileMenu(false)
                  }
                >
                  My Profile
                </NavLink>

                <button
                  className="dropdown-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        ) : (

          <NavLink
            to="/login"
            className="login-button"
          >
            Login
          </NavLink>

        )}

      </div>


      {/* ================= HAMBURGER MENU ================= */}
      {showMenu && (

        <div
          ref={menuRef}
          className="service-menu"
        >

          <div className="service-menu-header">
            <span>Campus Services</span>
            <span className="service-menu-subtitle">
              Explore StudentDeck
            </span>
          </div>


          <NavLink
            to="/"
            end
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🏠</span>
            <span>
              <strong>Home</strong>
              <small>Dashboard & updates</small>
            </span>
          </NavLink>


          <NavLink
            to="/marketplace"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🛒</span>
            <span>
              <strong>Marketplace</strong>
              <small>Buy & sell campus items</small>
            </span>
          </NavLink>


          <NavLink
            to="/lost-found"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🔎</span>
            <span>
              <strong>Lost & Found</strong>
              <small>Find lost campus items</small>
            </span>
          </NavLink>


          <NavLink
            to="/academic"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">📚</span>
            <span>
              <strong>Academic Resources</strong>
              <small>Notes & study material</small>
            </span>
          </NavLink>


          <NavLink
            to="/events"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">📅</span>
            <span>
              <strong>Events</strong>
              <small>Campus events & activities</small>
            </span>
          </NavLink>


          <NavLink
            to="/messages"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">💬</span>
            <span>
              <strong>Messages</strong>
              <small>Chat with students</small>
            </span>
          </NavLink>


          <NavLink
            to="/saved"
            className="service-menu-item"
            onClick={closeMenu}
          >
            <span className="service-icon">🔖</span>
            <span>
              <strong>Saved</strong>
              <small>Your saved posts</small>
            </span>
          </NavLink>


          {currentUser ? (

            <>
              <NavLink
                to="/profile"
                className="service-menu-item"
                onClick={closeMenu}
              >
                <span className="service-icon">👤</span>
                <span>
                  <strong>My Profile</strong>
                  <small>View your profile</small>
                </span>
              </NavLink>

              <button
                className="service-logout"
                onClick={handleLogout}
              >
                <span className="service-icon">↪</span>

                <span>
                  <strong>Logout</strong>
                  <small>Sign out of StudentDeck</small>
                </span>
              </button>
            </>

          ) : (

            <NavLink
              to="/login"
              className="service-menu-item service-login"
              onClick={closeMenu}
            >
              <span className="service-icon">🔐</span>

              <span>
                <strong>Login</strong>
                <small>Login to your account</small>
              </span>
            </NavLink>

          )}

        </div>

      )}

    </nav>
  )
}

export default Navbar