import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function ProviderProfile({ user }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    phone: '',
    address: '',
    email_password: '',
    email_service_type: 'gmail',
    business_slug: '',
    business_image_url: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const data = await apiRequest('/providers/me')
      if (data.provider) {
        setHasProfile(true)
        setFormData({
          business_name: data.provider.business_name || '',
          description: data.provider.description || '',
          phone: data.provider.phone || '',
          address: data.provider.address || '',
          email_password: '', // Don't show existing password for security
          email_service_type: data.provider.email_service_type || 'gmail',
          business_slug: data.provider.business_slug || '',
          business_image_url: data.provider.business_image_url || ''
        })
      }
    } catch (err) {
      // No profile yet, that's ok
      setHasProfile(false)
    } finally {
      setChecking(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = hasProfile ? '/providers/me' : '/providers'
      const method = hasProfile ? 'PUT' : 'POST'
      
      await apiRequest(endpoint, {
        method: method,
        body: JSON.stringify(formData)
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h1>{hasProfile ? 'Update' : 'Create'} Provider Profile</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {hasProfile 
            ? 'Update your business information'
            : 'Set up your provider profile to start offering services'
          }
        </p>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              required
              placeholder="e.g., Joe's Plumbing Service"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your business and services..."
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="555-0100"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          <div className="form-group">
            <label>Business Image/Logo URL</label>
            <input
              type="url"
              name="business_image_url"
              value={formData.business_image_url}
              onChange={handleChange}
              placeholder="https://example.com/your-business-logo.jpg"
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Add a URL to your business logo or main business image. This will be displayed on your booking page. 
              Recommended: Square image (500x500px or larger) for best results.
            </small>
            {formData.business_image_url && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={formData.business_image_url} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '150px', 
                    maxHeight: '150px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div style={{ display: 'none', color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                  Image failed to load. Please check the URL.
                </div>
              </div>
            )}
          </div>

          {hasProfile && formData.business_slug && (
            <div className="form-group">
              <label>Your Booking Page</label>
              <div style={{ 
                backgroundColor: '#e7f3ff', 
                padding: '20px', 
                borderRadius: '5px',
                border: '1px solid #007bff',
                textAlign: 'center'
              }}>
                <a
                  href={`/${formData.business_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '20px',
                    color: '#007bff',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '10px',
                    wordBreak: 'break-word'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  {formData.business_name || 'View Booking Page'}
                  <span style={{ fontSize: '14px', marginLeft: '8px' }}>🔗</span>
                </a>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  marginBottom: '15px',
                  fontFamily: 'monospace'
                }}>
                  {window.location.origin}/{formData.business_slug}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}/${formData.business_slug}`
                    navigator.clipboard.writeText(link)
                    alert('Link copied!')
                  }}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '14px' }}
                >
                  📋 Copy Link
                </button>
              </div>
              <small style={{ color: '#666', marginTop: '10px', display: 'block' }}>
                This is your unique booking page. Share the link above with customers!
              </small>
            </div>
          )}

          <div style={{ 
            marginTop: '30px', 
            paddingTop: '30px', 
            borderTop: '2px solid #e0e0e0' 
          }}>
            <h3 style={{ marginBottom: '15px' }}>Email Configuration</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              To send booking confirmation emails to your customers, you need to provide your email app password.
              <strong> Your email address ({user.email}) will be used to send emails.</strong>
            </p>

            <div className="form-group">
              <label>Email Service Type</label>
              <select
                name="email_service_type"
                value={formData.email_service_type}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="gmail">Gmail</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Email App Password <span style={{ color: '#999', fontSize: '12px' }}>(Optional but recommended)</span>
              </label>
              <input
                type="password"
                name="email_password"
                value={formData.email_password}
                onChange={handleChange}
                placeholder={formData.email_service_type === 'gmail' ? 'Gmail App Password (16 characters)' : 'Email password or API key'}
                style={{ fontFamily: 'monospace' }}
              />
              <small style={{ display: 'block', color: '#666', marginTop: '5px', fontSize: '12px' }}>
                {formData.email_service_type === 'gmail' ? (
                  <>
                    <strong>For Gmail:</strong> You need a Gmail App Password (not your regular password).
                    <br />
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#007bff' }}
                    >
                      Get Gmail App Password here →
                    </a>
                    <br />
                    <span style={{ fontSize: '11px' }}>
                      Enable 2-Step Verification first, then generate an App Password for "Mail"
                    </span>
                  </>
                ) : (
                  <>Enter your SMTP password or API key for custom email service</>
                )}
              </small>
            </div>

            {!formData.email_password && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '15px', 
                borderRadius: '5px', 
                marginBottom: '20px',
                border: '1px solid #ffc107'
              }}>
                <strong>⚠️ Note:</strong> Without an email password, booking confirmations will be logged but not sent via email.
                Customers will still see their booking confirmation on the website.
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProviderProfile


