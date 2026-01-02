import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function ManageServices({ user }) {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      // Check if provider profile exists
      try {
        await apiRequest('/providers/me')
        setHasProfile(true)
      } catch (err) {
        setHasProfile(false)
      }

      // Load services
      try {
        const servicesData = await apiRequest('/services')
        setServices(servicesData.services || [])
      } catch (err) {
        console.error('Error loading services:', err.message)
        setServices([])
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return
    }

    try {
      await apiRequest(`/services/${serviceId}`, {
        method: 'DELETE'
      })
      loadServices()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Services</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {!hasProfile ? (
        <div className="error" style={{ marginBottom: '20px' }}>
          You need to create your provider profile first before adding services.
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => navigate('/provider-profile')} className="btn btn-primary">
              Create Provider Profile
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your services. Add, edit, or remove services that customers can book.
            </p>
            <button 
              onClick={() => navigate('/add-service')} 
              className="btn btn-primary"
            >
              + Add New Service
            </button>
          </div>

          {loading ? (
            <div className="card">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No services yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Get started by adding your first service!
              </p>
              <button 
                onClick={() => navigate('/add-service')} 
                className="btn btn-primary"
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {services.map(service => (
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
                      backgroundColor: 'var(--bg-secondary)', 
                      borderRadius: '5px', 
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '14px',
                      border: '1px solid var(--border)'
                    }}>
                      No Image
                    </div>
                  )}
                  <h3>{service.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{service.description}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--accent)', marginBottom: '10px' }}>
                    ${service.price}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>Duration: {service.duration_minutes} minutes</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Category: {service.category}</p>
                  <p style={{ marginTop: '10px' }}>
                    Status: <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: service.is_active ? 'var(--success-soft)' : 'rgba(220, 38, 38, 0.1)',
                      color: service.is_active ? 'var(--success)' : 'var(--error)'
                    }}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  {service.average_rating && (
                    <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
                      ⭐ {service.average_rating} ({service.review_count} reviews)
                    </p>
                  )}
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigate(`/edit-service/${service.id}`)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ManageServices




