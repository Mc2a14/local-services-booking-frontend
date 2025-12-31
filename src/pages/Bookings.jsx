import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

function Bookings({ user }) {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← {t('common.backToHome')}
      </button>
      <h1>{t('booking.myBookings')}</h1>
      {loading ? (
        <div>{t('common.loading')}</div>
      ) : bookings.length === 0 ? (
        <div className="card">{t('booking.noBookings')}</div>
      ) : (
        <div>
          {bookings.map(booking => (
            <div key={booking.id} className="card">
              <h3>{booking.service_title}</h3>
              <p><strong>{t('common.date')}:</strong> {new Date(booking.booking_date).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}</p>
              <p><strong>{t('common.status')}:</strong> <span style={{ 
                textTransform: 'capitalize',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: booking.status === 'completed' ? '#d4edda' : 
                                booking.status === 'confirmed' ? '#cce5ff' : 
                                booking.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                color: booking.status === 'completed' ? '#155724' : 
                       booking.status === 'confirmed' ? '#004085' : 
                       booking.status === 'cancelled' ? '#721c24' : '#856404'
              }}>{t(`booking.${booking.status}`) || booking.status}</span></p>
              {user.user_type === 'customer' && booking.provider_name && (
                <p><strong>{t('booking.provider')}:</strong> {booking.provider_name}</p>
              )}
              {user.user_type === 'customer' && booking.business_name && (
                <p><strong>{t('booking.business')}:</strong> {booking.business_name}</p>
              )}
              {user.user_type === 'customer' && booking.price && (
                <p><strong>{t('common.price')}:</strong> ${booking.price}</p>
              )}
              {booking.notes && (
                <p><strong>{t('booking.notes')}:</strong> {booking.notes}</p>
              )}
              {user.user_type === 'customer' && booking.status === 'completed' && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                  <Link to={`/feedback/${booking.id}`} className="btn btn-primary">
                    {t('booking.leaveFeedback')}
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

