import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, removeToken } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

function Dashboard({ user }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await apiRequest('/services/browse')
      setServices(data.services)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    window.location.href = '/'
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>{t('dashboard.welcomeBack')}, {user.full_name}!</h1>
        <button onClick={handleLogout} className="btn btn-secondary">{t('common.logout')}</button>
      </div>

      <nav style={{ display: 'flex', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary">{t('common.backToHome')}</button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">{t('common.dashboard')}</button>
        <button onClick={() => navigate('/bookings')} className="btn btn-primary">{t('dashboard.myBookings')}</button>
      </nav>

      <h2 style={{ marginBottom: '20px' }}>{t('businessBooking.services')}</h2>

      {loading ? (
        <div>{t('common.loading')}</div>
      ) : services.length === 0 ? (
        <div className="card">{t('empty.noData')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {services.map(service => (
            <div key={service.id} className="card">
              {service.image_url ? (
                <img 
                  src={service.image_url} 
                  alt={service.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px', marginBottom: '15px' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '5px', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E2E8F0'
                }}>
                  {t('empty.noData')}
                </div>
              )}
              <h3>{service.title}</h3>
              <p style={{ color: '#475569', marginBottom: '10px' }}>{service.description}</p>
              <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#2563EB' }}>${service.price}</p>
              {service.average_rating && (
                <p>⭐ {service.average_rating} ({service.review_count} {t('empty.noResults')})</p>
              )}
              <button 
                onClick={() => navigate(`/book-service/${service.id}`)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {t('booking.bookButton')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard

