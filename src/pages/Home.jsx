import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

function Home() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const token = getToken()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      // Public endpoint - no auth needed
      // Use the same API_URL logic but without auth header
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/services/browse`)
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      console.error('Error loading services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookClick = (serviceId) => {
    // Always use guest booking - no login required
    navigate(`/book-service/${serviceId}`)
  }

  return (
    <div className="container">
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid #007bff'
      }}>
        <h1 style={{ margin: 0, color: '#007bff' }}>Local Services Booking</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {token ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                My Account
              </button>
              <button onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/'
              }} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-secondary">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '50px',
        padding: '40px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Book Local Services Easily</h2>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Find and book services from local providers. Simple, fast, and convenient.
        </p>
      </div>

      {/* Services Grid */}
      <h2 style={{ marginBottom: '30px' }}>Available Services</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading services...</div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No services available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {services.map(service => (
            <div key={service.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              {service.image_url ? (
                <img 
                  src={service.image_url} 
                  alt={service.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px', marginBottom: '15px' }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
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
                  color: '#6c757d'
                }}>
                  No Image
                </div>
              )}
              <h3>{service.title}</h3>
              {service.business_name && (
                <p style={{ color: '#007bff', fontWeight: 'bold', marginBottom: '10px' }}>
                  {service.business_name}
                </p>
              )}
              <p style={{ color: '#666', marginBottom: '10px', minHeight: '50px' }}>
                {service.description}
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '24px', color: '#007bff', marginBottom: '10px' }}>
                ${service.price}
              </p>
              {service.average_rating && (
                <p style={{ marginBottom: '15px' }}>
                  ⭐ {service.average_rating} ({service.review_count} {service.review_count === 1 ? 'review' : 'reviews'})
                </p>
              )}
              <button 
                onClick={() => handleBookClick(service.id)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home

