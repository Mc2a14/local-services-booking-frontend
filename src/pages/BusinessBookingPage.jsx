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
  const [isPhoneExpanded, setIsPhoneExpanded] = useState(false)
  const [isHoursExpanded, setIsHoursExpanded] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Handle booking suggestion from chat
  const handleBookingSuggestion = () => {
    setShowBookingModal(true)
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
      {/* Business Hero Section - Full Width at Top */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        padding: '60px 20px',
        borderBottom: '1px solid var(--border)',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Theme Toggle - Top Right */}
          <div style={{ 
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10
          }}>
            <ThemeToggle />
          </div>

          {/* Split Layout: Text Left, Image Right */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center'
            }}
            className="hero-split-layout"
          >
            {/* Left Side: Text and CTA */}
            <div style={{
              textAlign: 'left'
            }}>
              {/* Business Name */}
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                {business.business_name}
              </h1>

              {/* Short Description */}
              {business.description && (
                <p style={{
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  color: 'var(--text-secondary)',
                  marginBottom: '32px',
                  lineHeight: '1.5'
                }}>
                  {business.description.split('\n')[0].substring(0, 150)}
                  {business.description.split('\n')[0].length > 150 ? '...' : ''}
                </p>
              )}

              {/* Primary CTA Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="btn btn-primary"
                style={{
                  fontSize: '18px',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                Book a Session
              </button>
            </div>

            {/* Right Side: Business Image */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div
                className="card"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  width: '100%',
                  maxWidth: '400px',
                  aspectRatio: '4/3'
                }}
              >
                {business.business_image_url ? (
                  <img
                    src={business.business_image_url}
                    alt={business.business_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // Show placeholder if image fails to load
                      e.target.style.display = 'none'
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: business.business_image_url ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                    fontSize: '48px'
                  }}
                >
                  🏢
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* AI Chat Section */}
        <div style={{ marginTop: '60px', marginBottom: '40px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Chat with our AI assistant
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              Get instant answers about our services, hours, and more
            </p>
            <ChatWidget 
              businessSlug={businessSlug} 
              businessName={business.business_name} 
              inline={true} 
              defaultOpen={false}
              onSuggestBooking={handleBookingSuggestion}
              services={services}
            />
          </div>
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

        {/* Business Information - Collapsible Sections at Bottom */}
        <div style={{ marginTop: '60px', marginBottom: '40px' }}>
          {/* Phone Number Section */}
          {business.phone && (
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <button
                onClick={() => setIsPhoneExpanded(!isPhoneExpanded)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '400',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📞</span>
                  <span>Phone</span>
                </span>
                <span style={{
                  fontSize: '14px',
                  transition: 'transform 0.2s',
                  transform: isPhoneExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              {isPhoneExpanded && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)'
                }}>
                  <a
                    href={`tel:${business.phone}`}
                    style={{
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    {business.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Business Hours Section */}
          {business.business_hours && (
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <button
                onClick={() => setIsHoursExpanded(!isHoursExpanded)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '400',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🕐</span>
                  <span>Hours</span>
                </span>
                <span style={{
                  fontSize: '14px',
                  transition: 'transform 0.2s',
                  transform: isHoursExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              {isHoursExpanded && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)'
                }}>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}>
                    {business.business_hours}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* About Section */}
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
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '400',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>ℹ️</span>
                <span>About</span>
              </span>
              <span style={{
                fontSize: '14px',
                transition: 'transform 0.2s',
                transform: isBusinessInfoExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>
            {isBusinessInfoExpanded && (
              <div style={{
                padding: '16px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)'
              }}>
                {business.description && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    marginBottom: business.address ? '16px' : '0',
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
            )}
          </div>
        </div>

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

      {/* Booking Modal - Only shown when triggered */}
      {showBookingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            // Close modal if clicking backdrop
            if (e.target === e.currentTarget) {
              setShowBookingModal(false)
            }
          }}
        >
          <div
            className="card"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowBookingModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '28px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              aria-label="Close"
            >
              ×
            </button>

            {/* Modal Header */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              paddingRight: '40px'
            }}>
              Book a Session
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              Select a service to continue
            </p>

            {/* Services List */}
            {services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  No services available at this time. Please check back later.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {services.map(service => (
                  <div
                    key={service.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      border: '2px solid var(--border)',
                      transition: 'all 0.2s',
                      padding: '20px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onClick={() => {
                      setShowBookingModal(false)
                      handleBookService(service.id)
                    }}
                  >
                    {service.image_url && (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <h3 style={{
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '20px',
                      fontWeight: '600'
                    }}>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {service.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '24px',
                          fontWeight: '600',
                          color: 'var(--price-color)'
                        }}>
                          {service.price === 0 ? 'Free' : `$${service.price}`}
                        </span>
                        {service.duration_minutes && (
                          <span style={{
                            color: 'var(--text-secondary)',
                            marginLeft: '8px',
                            fontSize: '14px'
                          }}>
                            • {service.duration_minutes} min
                          </span>
                        )}
                      </div>
                      <button className="btn btn-primary">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default BusinessBookingPage
