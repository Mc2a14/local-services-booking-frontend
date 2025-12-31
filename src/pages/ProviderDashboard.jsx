import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, removeToken } from '../utils/auth'
import ThemeToggle from '../components/ThemeToggle'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'

function ProviderDashboard({ user }) {
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [provider, setProvider] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const navigate = useNavigate()
  const { t, language } = useLanguage()

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
        
        // Load services count, bookings, and feedback only if profile exists
        try {
          const [servicesData, bookingsData, feedbackData] = await Promise.all([
            apiRequest('/services'),
            apiRequest('/bookings/provider/my-bookings'),
            apiRequest('/feedback/business').catch(() => ({ feedback: [] })) // Don't fail if no feedback yet
          ])
          setServices(servicesData.services || [])
          setBookings(bookingsData.bookings || [])
          setFeedback(feedbackData.feedback || [])
        } catch (err) {
          // Silently handle errors loading services/bookings
          console.error('Error loading services/bookings:', err.message)
        }
      } catch (err) {
        // Profile doesn't exist or error checking profile
        setHasProfile(false)
        // Only show user-facing error for "Provider not found" (404)
        if (err.message && (err.message.includes('Provider not found') || err.message.includes('Not Found'))) {
          setProfileError(t('providerDashboard.needProfile'))
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
      {/* Header with Business Image, Name, and Logout */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        gap: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flex: 1
        }}>
          {/* Business Image */}
          {provider?.business_image_url && (
            <img
              src={provider.business_image_url}
              alt={provider.business_name || 'Business'}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}
          
          {/* Company Name - Dashboard */}
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              lineHeight: '1.2'
            }}>
              {provider?.business_name || user.full_name} - Dashboard
            </h1>
            {provider?.business_name && (
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.2'
              }}>
                {user.full_name}
              </p>
            )}
          </div>
        </div>
        
        {/* Logout Button */}
        <button onClick={handleLogout} className="btn btn-secondary" style={{ flexShrink: 0 }}>
          Logout
        </button>
      </header>

      {/* Theme Toggle and Language Toggle - Center between header and booking link */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <ThemeToggle />
        <LanguageToggle />
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
          <h2 style={{ marginBottom: '15px', color: '#2563EB' }}>{t('providerDashboard.yourBookingPage')}</h2>
          <p style={{ fontSize: '18px', marginBottom: '20px', color: '#0F172A' }}>
            {t('providerDashboard.shareLink')}
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
              {provider.business_name || t('providerDashboard.viewBookingPage')}
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
                alert(language === 'es' ? '¡Enlace copiado al portapapeles!' : 'Link copied to clipboard!')
              }}
              className="btn btn-primary"
              style={{ marginRight: '10px' }}
            >
              📋 {t('providerDashboard.copyLink')}
            </button>
            <button
              onClick={() => window.open(`/${provider.business_slug}`, '_blank')}
              className="btn btn-secondary"
            >
              👁️ {t('providerDashboard.preview')}
            </button>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">{t('common.dashboard')}</button>
        <button onClick={() => navigate('/provider-profile')} className="btn btn-secondary">{t('providerDashboard.myProfile')}</button>
        <button onClick={() => navigate('/manage-services')} className="btn btn-primary">{t('providerDashboard.myServices')}</button>
        <button onClick={() => navigate('/availability')} className="btn btn-primary">{t('providerDashboard.setAvailability')}</button>
        <button onClick={() => navigate('/manage-faqs')} className="btn btn-primary">💬 {t('providerDashboard.manageFAQs')}</button>
        <button onClick={() => navigate('/requests')} className="btn btn-primary">📥 {t('providerDashboard.requests')}</button>
        <button 
          onClick={() => setShowFeedback(!showFeedback)} 
          className="btn btn-secondary"
          style={{ position: 'relative' }}
        >
          💬 {t('feedback.privateFeedback')} {feedback.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {feedback.length}
            </span>
          )}
        </button>
      </nav>

      {profileError && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {profileError}
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => navigate('/provider-profile')} className="btn btn-primary">
              {t('providerDashboard.createProfile')}
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/manage-services')}>
          <h2 style={{ fontSize: '48px', margin: '10px 0' }}>📦</h2>
          <h3 style={{ marginBottom: '5px' }}>{t('providerDashboard.myServices')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>
            {services.length} {services.length === 1 ? t('providerDashboard.servicesCount') : t('providerDashboard.servicesCountPlural')}
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            {t('providerDashboard.manageServices')}
          </button>
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{t('booking.recentBookings')}</h2>
          <button onClick={() => navigate('/bookings')} className="btn btn-secondary">
            {t('booking.viewAllBookings')} →
          </button>
        </div>
        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3>{t('booking.noBookingsYet')}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('booking.noBookingsDesc')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {bookings.slice(0, 10).map(booking => (
              <div key={booking.id} className="card">
                <h3>{booking.service_title}</h3>
                <p><strong>{t('booking.customer')}:</strong> {booking.customer_name}</p>
                <p><strong>{t('common.date')}:</strong> {new Date(booking.booking_date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</p>
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
                {booking.notes && (
                  <p style={{ marginTop: '10px' }}><strong>{t('booking.notes')}:</strong> {booking.notes}</p>
                )}
                {booking.status === 'pending' && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="btn btn-primary"
                    >
                      {t('booking.confirmBooking')}
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="btn btn-secondary"
                    >
                      {t('booking.cancelBooking')}
                    </button>
                  </div>
                )}
                {booking.status === 'confirmed' && (
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="btn btn-primary"
                    >
                      {t('booking.markCompleted')}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {bookings.length > 10 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={() => navigate('/bookings')} className="btn btn-primary">
                  {t('booking.viewAllBookings')} {bookings.length} →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{t('feedback.privateFeedback')}</h2>
            <button onClick={() => setShowFeedback(false)} className="btn btn-secondary">
              {t('common.close')}
            </button>
          </div>
          {feedback.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>{t('feedback.noFeedbackYet')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t('feedback.noFeedbackDesc')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {feedback.map((item) => (
                <div key={item.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0' }}>{item.service_title || 'Service'}</h3>
                      <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {item.customer_name || t('booking.customer')} • {new Date(item.booking_date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            fontSize: '20px',
                            color: star <= item.rating ? '#FFD700' : '#ccc'
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                      <span style={{ marginLeft: '8px', fontWeight: '600' }}>
                        {item.rating}/5
                      </span>
                    </div>
                  </div>
                  {item.comment && (
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                        "{item.comment}"
                      </p>
                    </div>
                  )}
                  <p style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {t('feedback.submitted')}: {new Date(item.created_at).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard

