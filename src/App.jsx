import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Bookings from './pages/Bookings'
import ProviderDashboard from './pages/ProviderDashboard'
import BookService from './pages/BookService'
import BookServiceGuest from './pages/BookServiceGuest'
import BusinessBookingPage from './pages/BusinessBookingPage'
import AddService from './pages/AddService'
import EditService from './pages/EditService'
import ProviderProfile from './pages/ProviderProfile'
import Availability from './pages/Availability'
import ManageFAQs from './pages/ManageFAQs'
import ManageServices from './pages/ManageServices'
import Requests from './pages/Requests'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangeCredentials from './pages/ChangeCredentials'
import FeedbackForm from './pages/FeedbackForm'
import ThemeToggle from './components/ThemeToggle'
import { getToken, apiRequest } from './utils/auth'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      // Verify token and get user info
      apiRequest('/auth/me')
        .then(data => {
          if (data.user) {
            setUser(data.user)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Public routes - exact paths first */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/feedback/:appointmentId" element={<FeedbackForm />} />
        
        {/* Public business booking page - MUST come after exact routes */}
        <Route path="/:businessSlug" element={<BusinessBookingPage />} />
        
        {/* Protected routes - require login */}
        <Route path="/dashboard" element={user ? (user.user_type === 'provider' ? <ProviderDashboard user={user} /> : <Dashboard user={user} />) : <Navigate to="/login" />} />
        <Route path="/services" element={user ? <Services user={user} /> : <Navigate to="/login" />} />
        <Route path="/bookings" element={user ? <Bookings user={user} /> : <Navigate to="/login" />} />
        {/* Public booking route - no login required */}
        <Route path="/book-service/:serviceId" element={<BookServiceGuest />} />
        {/* Legacy route for logged-in users (optional) */}
        <Route path="/dashboard/book-service/:serviceId" element={user ? <BookService user={user} /> : <Navigate to="/login" />} />
        
        {/* Provider-only routes */}
        <Route path="/add-service" element={user && user.user_type === 'provider' ? <AddService user={user} /> : <Navigate to="/login" />} />
        <Route path="/edit-service/:id" element={user && user.user_type === 'provider' ? <EditService user={user} /> : <Navigate to="/login" />} />
        <Route path="/provider-profile" element={user && user.user_type === 'provider' ? <ProviderProfile user={user} /> : <Navigate to="/login" />} />
        <Route path="/availability" element={user && user.user_type === 'provider' ? <Availability user={user} /> : <Navigate to="/login" />} />
        <Route path="/manage-faqs" element={user && user.user_type === 'provider' ? <ManageFAQs user={user} /> : <Navigate to="/login" />} />
        <Route path="/manage-services" element={user && user.user_type === 'provider' ? <ManageServices user={user} /> : <Navigate to="/login" />} />
        <Route path="/requests" element={user && user.user_type === 'provider' ? <Requests user={user} /> : <Navigate to="/login" />} />
        <Route path="/change-credentials" element={user ? <ChangeCredentials user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App

