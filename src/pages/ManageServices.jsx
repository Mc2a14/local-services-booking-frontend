import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'

function ManageServices({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setupStep = searchParams.get('setup')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)

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

  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedItem === null || draggedItem === dropIndex) {
      return
    }

    const newServices = [...services]
    const draggedService = newServices[draggedItem]
    
    // Remove dragged item
    newServices.splice(draggedItem, 1)
    
    // Insert at new position
    newServices.splice(dropIndex, 0, draggedService)
    
    // Update display_order for all services
    const serviceOrders = newServices.map((service, index) => ({
      id: service.id,
      display_order: index
    }))

    // Optimistically update UI
    setServices(newServices)

    try {
      await apiRequest('/services/reorder', {
        method: 'POST',
        body: JSON.stringify({ serviceOrders })
      })
    } catch (err) {
      // Revert on error
      loadServices()
      alert('Failed to reorder services: ' + (err.message || 'Unknown error'))
    }
    
    setDraggedItem(null)
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Services</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {setupStep === 'services' && (
        <div style={{
          padding: '15px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, color: '#92400E', fontSize: '14px', lineHeight: '1.6' }}>
            <strong>💡 {t('setupProgress.helperTitle')}:</strong><br />
            {t('setupProgress.step2Helper')}
          </p>
        </div>
      )}

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
            <div>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid var(--border)'
              }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                  💡 <strong>How to reorder services:</strong> Click and hold any service card, then drag it to a new position. The order will be saved automatically. 
                  <br />
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Look for the drag handle (⋮⋮) icon in the top-right corner of each card.</span>
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {services.map((service, index) => (
                  <div 
                    key={service.id} 
                    className="card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{
                      cursor: draggedItem === null ? 'grab' : draggedItem === index ? 'grabbing' : 'default',
                      opacity: draggedItem === index ? 0.5 : 1,
                      transition: draggedItem === null ? 'opacity 0.2s, transform 0.2s' : 'none',
                      position: 'relative',
                      transform: draggedItem === index ? 'scale(0.95)' : 'scale(1)',
                      border: draggedItem === index ? '2px dashed var(--accent)' : 'none'
                    }}
                  >
                    <div style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px',
                      fontSize: '24px',
                      color: 'var(--text-primary)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      fontWeight: 'bold',
                      opacity: 0.8,
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      lineHeight: '1',
                      letterSpacing: '2px'
                    }}>
                      ⋮⋮
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: draggedItem === null ? 'none' : 'block'
                    }}>
                      #{(index + 1)}
                    </div>
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
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ManageServices




