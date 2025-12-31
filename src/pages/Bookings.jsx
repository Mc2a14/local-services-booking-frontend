import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function Bookings({ user }) {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const endpoint = user.user_type === 'provider' 
        ? '/bookings/provider/my-bookings'
        : '/bookings/my-bookings'
      const data = await apiRequest(endpoint)
      setBookings(data.bookings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Home
      </button>
      <h1>My Bookings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="card">No bookings found</div>
      ) : (
        <div>
          {bookings.map(booking => (
            <div key={booking.id} className="card">
              <h3>{booking.service_title}</h3>
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
              {user.user_type === 'customer' && booking.provider_name && (
                <p><strong>Provider:</strong> {booking.provider_name}</p>
              )}
              {user.user_type === 'customer' && booking.business_name && (
                <p><strong>Business:</strong> {booking.business_name}</p>
              )}
              {user.user_type === 'customer' && booking.price && (
                <p><strong>Price:</strong> ${booking.price}</p>
              )}
              {booking.notes && (
                <p><strong>Notes:</strong> {booking.notes}</p>
              )}
              {user.user_type === 'customer' && booking.status === 'completed' && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                  <Link to={`/feedback/${booking.id}`} className="btn btn-primary">
                    Leave Feedback
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings

