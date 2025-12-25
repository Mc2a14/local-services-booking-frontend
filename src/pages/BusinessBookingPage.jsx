import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ChatWidget from '../components/ChatWidget'

function BusinessBookingPage() {
  const { businessSlug } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  useEffect(() => {
    loadBusiness()
  }, [businessSlug])

  const loadBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/public/b/${businessSlug}`)
      if (!response.ok) {
        throw new Error('Business not found')
      }
      const data = await response.json()
      setBusiness(data.business)
      setServices(data.services || [])
      setTestimonials(data.testimonials || [])
    } catch (err) {
      setError(err.message || 'Business not found')
    } finally {
      setLoading(false)
    }
  }

  const handleBookService = (serviceId) => {
    navigate(`/book-service/${serviceId}`)
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h1 style={{ color: '#DC2626' }}>Business Not Found</h1>
          <p style={{ color: '#475569', marginBottom: '20px' }}>
            The business page you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }


  return (
    <>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Business Header */}
      <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
        {business.business_image_url && (
          <img 
            src={business.business_image_url} 
            alt={business.business_name}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '250px',
              borderRadius: '12px',
              objectFit: 'cover',
              marginBottom: '20px',
              border: '2px solid #2563EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        )}
        <h1 style={{ marginBottom: '10px', color: '#2563EB' }}>{business.business_name}</h1>
        {business.description && (
          <p style={{ color: '#475569', fontSize: '18px', marginBottom: '20px' }}>
            {business.description}
          </p>
        )}
        {business.phone && (
          <p style={{ color: '#475569', marginBottom: '10px' }}>
            📞 {business.phone}
          </p>
        )}
        {business.address && (
          <p style={{ color: '#475569', marginBottom: '20px' }}>
            📍 {business.address}
          </p>
        )}
      </div>

      {/* AI Chat Widget - Prominent placement */}
      <ChatWidget businessSlug={businessSlug} businessName={business?.business_name} inline={true} />

      {/* Services */}
      <h2 style={{ marginBottom: '20px' }}>Available Services</h2>
      
      {services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#475569' }}>No services available at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {services.map(service => (
            <div 
              key={service.id} 
              className="card" 
              style={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => handleBookService(service.id)}
            >
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
                  No Image
                </div>
              )}
              <h3>{service.title}</h3>
              {service.category && (
                <p style={{ color: '#2563EB', fontSize: '14px', marginBottom: '10px' }}>
                  {service.category}
                </p>
              )}
              <p style={{ color: '#475569', marginBottom: '10px', minHeight: '50px' }}>
                {service.description}
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '24px', color: '#2563EB', marginBottom: '10px' }}>
                ${parseFloat(service.price).toFixed(2)}
              </p>
              {service.duration_minutes && (
                <p style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>
                  ⏱️ {service.duration_minutes} minutes
                </p>
              )}
              {service.average_rating && (
                <p style={{ marginBottom: '15px' }}>
                  ⭐ {service.average_rating} ({service.review_count} {service.review_count === 1 ? 'review' : 'reviews'})
                </p>
              )}
              <button 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <>
          <h2 style={{ marginTop: '50px', marginBottom: '20px' }}>What Our Customers Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="card" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ 
                      fontSize: '24px',
                      marginRight: '10px'
                    }}>
                      {'⭐'.repeat(testimonial.rating)}
                    </div>
                    <div>
                      <strong>{testimonial.customer_name}</strong>
                      {testimonial.service_title && (
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          {testimonial.service_title}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {testimonial.comment && (
                  <p style={{ color: '#0F172A', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}>
                    "{testimonial.comment}"
                  </p>
                )}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  marginTop: '15px',
                  borderTop: '1px solid #eee',
                  paddingTop: '10px'
                }}>
                  {new Date(testimonial.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </div>
    </>
  )
}

export default BusinessBookingPage

