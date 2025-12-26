import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, removeToken } from '../utils/auth'
import ThemeToggle from '../components/ThemeToggle'

function ProviderDashboard({ user }) {
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [provider, setProvider] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check if provider profile exists
      try {
        const profileData = await apiRequest('/providers/me')
        setProvider(profileData.provider)
        setHasProfile(true)
        setProfileError('')
        
        // Load services count and bookings only if profile exists
        try {
          const [servicesData, bookingsData] = await Promise.all([
            apiRequest('/services'),
            apiRequest('/bookings/provider/my-bookings')
          ])
          setServices(servicesData.services || [])
          setBookings(bookingsData.bookings || [])
        } catch (err) {
          // Silently handle errors loading services/bookings
          console.error('Error loading services/bookings:', err.message)
        }
      } catch (err) {
        // Profile doesn't exist or error checking profile
        setHasProfile(false)
        // Only show user-facing error for "Provider not found" (404)
        if (err.message && (err.message.includes('Provider not found') || err.message.includes('Not Found'))) {
          setProfileError('You need to create your provider profile first before adding services or viewing bookings.')
        }
        // Don't log 404 errors - they're expected when profile doesn't exist
        if (!err.message || !err.message.includes('Not Found')) {
          console.error('Error checking profile:', err.message)
        }
        setServices([])
        setBookings([])
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    window.location.href = '/'
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Provider Dashboard - {user.full_name}</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </div>

      {/* Theme Toggle - Center between header and booking link */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
        <ThemeToggle />
      </div>

      {/* Business Booking Link - Prominently Displayed */}
      {hasProfile && provider?.business_slug && (
        <div className="card" style={{ 
          backgroundColor: '#e7f3ff', 
          border: '2px solid #2563EB',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#2563EB' }}>Your Booking Page</h2>
          <p style={{ fontSize: '18px', marginBottom: '20px', color: '#0F172A' }}>
            Share this link with your customers to let them book your services:
          </p>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <a
              href={`/${provider.business_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '24px',
                color: '#2563EB',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'block',
                marginBottom: '15px',
                wordBreak: 'break-word'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              {provider.business_name || 'View Booking Page'}
              <span style={{ fontSize: '16px', marginLeft: '8px' }}>🔗</span>
            </a>
            <div style={{ 
              fontSize: '12px', 
              color: '#475569', 
              marginBottom: '15px',
              fontFamily: 'monospace'
            }}>
              {window.location.origin}/{provider.business_slug}
            </div>
            <button
              onClick={() => {
                const link = `${window.location.origin}/${provider.business_slug}`
                navigator.clipboard.writeText(link)
                alert('Link copied to clipboard!')
              }}
              className="btn btn-primary"
              style={{ marginRight: '10px' }}
            >
              📋 Copy Link
            </button>
            <button
              onClick={() => window.open(`/${provider.business_slug}`, '_blank')}
              className="btn btn-secondary"
            >
              👁️ Preview
            </button>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Dashboard</button>
        <button onClick={() => navigate('/provider-profile')} className="btn btn-secondary">My Profile</button>
        <button onClick={() => navigate('/manage-services')} className="btn btn-primary">My Services</button>
        <button onClick={() => navigate('/availability')} className="btn btn-primary">Set Availability</button>
        <button onClick={() => navigate('/manage-faqs')} className="btn btn-primary">💬 Manage FAQs</button>
        <button onClick={() => navigate('/requests')} className="btn btn-primary">📥 Requests</button>
      </nav>

      {profileError && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {profileError}
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => navigate('/provider-profile')} className="btn btn-primary">
              Create Provider Profile
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/manage-services')}>
          <h2 style={{ fontSize: '48px', margin: '10px 0' }}>📦</h2>
          <h3 style={{ marginBottom: '5px' }}>My Services</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>
            {services.length} {services.length === 1 ? 'service' : 'services'}
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            Manage Services →
          </button>
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Recent Bookings</h2>
          <button onClick={() => navigate('/bookings')} className="btn btn-secondary">
            View All Bookings →
          </button>
        </div>
        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No bookings yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your bookings will appear here once customers start booking your services.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {bookings.slice(0, 10).map(booking => (
              <div key={booking.id} className="card">
                <h3>{booking.service_title}</h3>
                <p><strong>Customer:</strong> {booking.customer_name}</p>
                <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span style={{ 
                  textTransform: 'capitalize',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: booking.status === 'completed' ? '#d4edda' : 
                                  booking.status === 'confirmed' ? '#cce5ff' : 
                                  booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                  color: booking.status === 'completed' ? '#155724' : 
                         booking.status === 'confirmed' ? '#004085' : 
                         booking.status === 'cancelled' ? '#721c24' : '#856404'
                }}>{booking.status}</span></p>
                {booking.notes && (
                  <p style={{ marginTop: '10px' }}><strong>Notes:</strong> {booking.notes}</p>
                )}
                {booking.status === 'pending' && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="btn btn-primary"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {booking.status === 'confirmed' && (
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="btn btn-primary"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
            {bookings.length > 10 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={() => navigate('/bookings')} className="btn btn-primary">
                  View All {bookings.length} Bookings →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProviderDashboard

