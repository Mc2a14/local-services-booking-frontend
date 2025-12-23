import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, removeToken } from '../utils/auth'

function ProviderDashboard({ user }) {
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check if provider profile exists
      try {
        await apiRequest('/providers/me')
        setHasProfile(true)
        setProfileError('')
        
        // Load services and bookings only if profile exists
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

      <nav style={{ display: 'flex', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Dashboard</button>
        <button onClick={() => navigate('/bookings')} className="btn btn-primary">Bookings</button>
        <button onClick={() => navigate('/availability')} className="btn btn-primary">Set Availability</button>
        <button onClick={() => navigate('/provider-profile')} className="btn btn-secondary">My Profile</button>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>My Services</h2>
          <button 
            onClick={() => navigate('/add-service')} 
            className="btn btn-primary" 
            style={{ marginBottom: '20px' }}
            disabled={!hasProfile}
            title={!hasProfile ? 'Create your provider profile first' : ''}
          >
            Add New Service
          </button>
          {services.length === 0 ? (
            <div className="card">No services yet. Add your first service!</div>
          ) : (
            services.map(service => (
              <div key={service.id} className="card">
                {service.image_url ? (
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '15px' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '150px', 
                    backgroundColor: '#e9ecef', 
                    borderRadius: '5px', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d',
                    fontSize: '14px'
                  }}>
                    No Image
                  </div>
                )}
                <h3>{service.title}</h3>
                <p style={{ color: '#666', marginBottom: '10px' }}>{service.description}</p>
                <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#007bff', marginBottom: '10px' }}>
                  ${service.price}
                </p>
                <p>Duration: {service.duration_minutes} minutes</p>
                <p>Category: {service.category}</p>
                <p style={{ marginTop: '10px' }}>
                  Status: <span style={{ 
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: service.is_active ? '#d4edda' : '#f8d7da',
                    color: service.is_active ? '#155724' : '#721c24'
                  }}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
                {service.average_rating && (
                  <p style={{ marginTop: '10px' }}>⭐ {service.average_rating} ({service.review_count} reviews)</p>
                )}
              </div>
            ))
          )}
        </div>

        <div>
          <h2>Bookings</h2>
          {bookings.length === 0 ? (
            <div className="card">No bookings yet.</div>
          ) : (
            bookings.map(booking => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderDashboard

