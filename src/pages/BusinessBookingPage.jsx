import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ChatWidget from '../components/ChatWidget'
import ThemeToggle from '../components/ThemeToggle'

function BusinessBookingPage() {
  const { businessSlug } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBusinessInfoExpanded, setIsBusinessInfoExpanded] = useState(false)
  const [showBookingServices, setShowBookingServices] = useState(false)
  const servicesSectionRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Handle booking suggestion from chat
  const handleBookingSuggestion = () => {
    setShowBookingServices(true)
    // Scroll to services section after a brief delay
    setTimeout(() => {
      servicesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)
  }

  useEffect(() => {
    // Immediately force scroll to absolute top before anything renders
    const forceTop = () => {
      window.scrollTo(0, 0)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      document.documentElement.scrollLeft = 0
      document.body.scrollLeft = 0
      
      // Also try scrollIntoView on body/html
      if (document.body) {
        document.body.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
      if (document.documentElement) {
        document.documentElement.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
    
    // Force immediately multiple times
    forceTop()
    
    // Use requestAnimationFrame to ensure it happens after render
    requestAnimationFrame(() => {
      forceTop()
      requestAnimationFrame(() => {
        forceTop()
      })
    })
    
    // Also force on load
    window.addEventListener('load', forceTop, { once: true })
    
    // Keep forcing top position aggressively for first 3 seconds
    const intervals = [0, 10, 20, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000]
    intervals.forEach(delay => {
      setTimeout(forceTop, delay)
    })
    
    loadBusiness()
    
    return () => {
      window.removeEventListener('load', forceTop)
    }
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
          <h1 style={{ color: 'var(--error)' }}>Business Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
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
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header with Business Logo and Theme Toggle */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 0',
          marginBottom: '16px',
          gap: '16px'
        }}>
          {/* Business Logo/Image */}
          {business.business_image_url && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1
            }}>
              <img
                src={business.business_image_url}
                alt={business.business_name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '2px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  lineHeight: '1.2'
                }}>
                  {business.business_name}
                </h2>
                {business.phone && (
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.2'
                  }}>
                    {business.phone}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Theme Toggle on Right */}
          <div style={{ flexShrink: 0 }}>
            <ThemeToggle />
          </div>
        </header>

        {/* AI Hero Section - Mobile Optimized */}
        <div className="card hero-section" style={{ 
          marginBottom: '20px', // Reduced margin
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
          border: '2px solid var(--ai-accent)',
          padding: '16px' // Reduced padding
        }}>
          <div className="hero-emoji" style={{ marginBottom: '8px', fontSize: '48px' }}>👋</div>
          <h1 className="hero-title" style={{ 
            color: 'var(--text-primary)',
            fontWeight: '600',
            lineHeight: '1.3',
            marginBottom: '8px' // Reduced margin
          }}>
            Hi! I'm {business.business_name}'s AI Assistant
          </h1>
          <p className="hero-subtext" style={{ 
            color: 'var(--text-secondary)', 
            maxWidth: '600px',
            margin: '0 auto 16px auto', // Reduced bottom margin
            lineHeight: '1.4',
            fontSize: '14px' // Slightly smaller
          }}>
            You can ask questions, check availability, or book a session instantly.
          </p>
          
          {/* AI Chat Widget - Open by default as primary CTA */}
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <ChatWidget 
              businessSlug={businessSlug} 
              businessName={business.business_name} 
              inline={true} 
              defaultOpen={true}
              onSuggestBooking={handleBookingSuggestion}
              services={services}
            />
          </div>
        </div>

        {/* Business Info - Collapsible Secondary Section */}
        <div style={{ marginBottom: '24px' }}>
          {/* Contact info - Always visible but secondary */}
          {business.phone && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '13px', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span>📞</span>
                <a 
                  href={`tel:${business.phone}`} 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    textDecoration: 'none' 
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {business.phone}
                </a>
              </p>
            </div>
          )}

          {/* Collapsible About Section */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setIsBusinessInfoExpanded(!isBusinessInfoExpanded)}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-expanded={isBusinessInfoExpanded}
            >
              <span>About this business</span>
              <span style={{
                fontSize: '18px',
                transition: 'transform 0.2s',
                transform: isBusinessInfoExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>

            {isBusinessInfoExpanded && (
              <div style={{
                padding: '20px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: business.business_image_url ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr',
                  gap: '30px', 
                  alignItems: 'start' 
                }}>
                  {business.business_image_url && (
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={business.business_image_url} 
                        alt={business.business_name}
                        style={{
                          width: '100%',
                          maxWidth: '200px',
                          height: '200px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--border)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 style={{ 
                      marginBottom: '12px', 
                      color: 'var(--text-primary)', 
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {business.business_name}
                    </h3>
                    {business.description && (
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '15px', 
                        marginBottom: '20px', 
                        lineHeight: '1.6' 
                      }}>
                        {business.description}
                      </p>
                    )}
                    {business.address && (
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        margin: 0,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <span>📍</span>
                        <span>{business.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services Section - Secondary CTA */}
        <div ref={servicesSectionRef} style={{ marginBottom: '32px' }}>
          {showBookingServices && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '16px',
              backgroundColor: 'var(--success-soft)',
              border: '1px solid var(--success)',
              borderRadius: '8px',
              color: 'var(--success)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.3s ease-in',
              lineHeight: '1.4'
            }}>
              <span>💡</span>
              <span>Our AI suggested booking - check out available services below!</span>
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px' }}>What would you like to do?</h2>
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)', 
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              Or ask me above! 👆
            </p>
          </div>
          
          {services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>I don't have any services listed at the moment. Feel free to ask me questions above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {services.map(service => (
                <div 
                  key={service.id} 
                  className="card" 
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                  onClick={() => handleBookService(service.id)}
                >
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.title} 
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '180px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderRadius: '8px', 
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)'
                    }}>
                      No Image
                    </div>
                  )}
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{service.title}</h3>
                  {service.category && (
                    <p style={{ color: 'var(--accent)', fontSize: '13px', marginBottom: '10px', fontWeight: '500' }}>
                      {service.category}
                    </p>
                  )}
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '40px', fontSize: '14px', lineHeight: '1.5' }}>
                    {service.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '22px', color: 'var(--price-color)', margin: 0 }}>
                      ${parseFloat(service.price).toFixed(2)}
                    </p>
                    {service.duration_minutes && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                        ⏱️ {service.duration_minutes} min
                      </p>
                    )}
                  </div>
                  {service.average_rating && (
                    <p style={{ marginBottom: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      ⭐ {service.average_rating} ({service.review_count} {service.review_count === 1 ? 'review' : 'reviews'})
                    </p>
                  )}
                  <div style={{ marginTop: '12px' }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ 
                        width: '100%',
                        minHeight: '44px',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookService(service.id)
                      }}
                    >
                      Book a Session
                    </button>
                    <p style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}>
                      Our AI will guide you through availability and confirmation.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust Signals - Testimonials */}
        {testimonials.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ 
              marginBottom: '20px', 
              color: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Trusted by Our Customers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="card" style={{ 
                  padding: '20px', 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ 
                        fontSize: '16px',
                        lineHeight: '1.2',
                        flexShrink: 0
                      }}>
                        {'⭐'.repeat(testimonial.rating)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                          {testimonial.customer_name}
                        </strong>
                        {testimonial.service_title && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {testimonial.service_title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {testimonial.comment && (
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      lineHeight: '1.5', 
                      fontSize: '13px',
                      margin: '0 0 12px 0' 
                    }}>
                      "{testimonial.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Atencio Platform Branding - Subtle Footer */}
        <div style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            margin: 0,
            opacity: 0.7
          }}>
            Powered by Atencio
          </p>
        </div>
      </div>
    </>
  )
}

export default BusinessBookingPage
