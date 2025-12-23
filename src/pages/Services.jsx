import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function Services({ user }) {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Home
      </button>
      <h1>Browse Services</h1>
      {loading ? (
        <div>Loading...</div>
      ) : services.length === 0 ? (
        <div className="card">No services available</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
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
                  color: '#6c757d'
                }}>
                  No Image
                </div>
              )}
              <h3>{service.title}</h3>
              <p style={{ color: '#666', marginBottom: '10px' }}>{service.description}</p>
              <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#007bff', marginBottom: '10px' }}>${service.price}</p>
              {service.average_rating && (
                <p style={{ marginBottom: '15px' }}>⭐ {service.average_rating} ({service.review_count} reviews)</p>
              )}
              <button 
                onClick={() => navigate(`/book-service/${service.id}`)}
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

export default Services

