import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Marketplace from './pages/Marketplace'
import CreateListing from './pages/CreateListing'
import ListingDetails from './pages/ListingDetails'
import LostFound from './pages/LostFound'
import LostFoundDetails from './pages/LostFoundDetails'
import EditLostFound from './pages/EditLostFound'
import Academic from './pages/Academic'
import AcademicDetails from './pages/AcademicDetails'
import EditAcademicResource from './pages/EditAcademicResource'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import EditEvent from './pages/EditEvent'
import Messages from './pages/Messages'
import EditListing from './pages/EditListing'
import Saved from './pages/Saved'
import NotFound from './pages/NotFound'
import CreateLostFound from './pages/CreateLostFound'
import CreateAcademic from './pages/CreateAcademic'
import CreateEvent from './pages/CreateEvent'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route
            path="/marketplace"
            element={<Marketplace />}
          />

          <Route
            path="/marketplace/:id"
            element={<ListingDetails />}
          />

          <Route
            path="/lost-found"
            element={<LostFound />}
          />

          <Route
            path="/lost-found/:id"
            element={<LostFoundDetails />}
          />

          <Route
            path="/academic"
            element={<Academic />}
          />

          <Route
            path="/academic/:id"
            element={<AcademicDetails />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          {/* Routes below require the user to be logged in,
              but still render inside the shared layout so the
              navbar and footer are always present. */}
          <Route element={<ProtectedRoute />}>

            {/* Marketplace */}
            <Route
              path="/marketplace/:id/edit"
              element={<EditListing />}
            />

            <Route
              path="/marketplace/create"
              element={<CreateListing />}
            />

            {/* Lost & Found */}
            <Route
              path="/lost-found/:id/edit"
              element={<EditLostFound />}
            />

            <Route
              path="/lost-found/create"
              element={<CreateLostFound />}
            />

            {/* Academic */}
            <Route
              path="/academic/:id/edit"
              element={<EditAcademicResource />}
            />

            <Route
              path="/academic/create"
              element={<CreateAcademic />}
            />

            {/* Events */}
            <Route
              path="/events/:id/edit"
              element={<EditEvent />}
            />

            <Route
              path="/events/create"
              element={<CreateEvent />}
            />

            {/* Other protected pages */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/messages"
              element={<Messages />}
            />

            <Route
              path="/saved"
              element={<Saved />}
            />

          </Route>

          <Route path="*" element={<NotFound />} />

        </Route>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App