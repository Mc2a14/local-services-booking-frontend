import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest, getToken } from '../utils/auth'
import ImageCropper from '../components/ImageCropper'
import { useLanguage } from '../contexts/LanguageContext'

function ProviderProfile({ user, setUser }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useLanguage()
  const setupStep = searchParams.get('setup')
  const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'credentials'
  
  // Business Profile state
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
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState(null)
  
  // Change Credentials state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  })
  const [credentialsError, setCredentialsError] = useState('')
  const [credentialsSuccess, setCredentialsSuccess] = useState('')
  const [credentialsLoading, setCredentialsLoading] = useState(false)
  const [credentialsTab, setCredentialsTab] = useState('password') // 'password' or 'email'

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
    setSuccess('')
    setLoading(true)

    try {
      const endpoint = hasProfile ? '/providers/me' : '/providers'
      const method = hasProfile ? 'PUT' : 'POST'
      
      await apiRequest(endpoint, {
        method: method,
        body: JSON.stringify(formData)
      })
      
      // Show success message
      setSuccess(hasProfile ? 'Profile updated successfully! ✅' : 'Profile created successfully! ✅')
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  // Redirect if not logged in
  if (!getToken()) {
    navigate('/login')
    return null
  }

  // Change Credentials handlers
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
    setCredentialsError('')
    setCredentialsSuccess('')
  }

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    })
    setCredentialsError('')
    setCredentialsSuccess('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setCredentialsError('')
    setCredentialsSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setCredentialsError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setCredentialsError('Password must be at least 6 characters')
      return
    }

    setCredentialsLoading(true)

    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      setCredentialsSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setCredentialsError(err.message || 'Failed to change password')
    } finally {
      setCredentialsLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setCredentialsError('')
    setCredentialsSuccess('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailData.newEmail)) {
      setCredentialsError('Invalid email format')
      return
    }

    if (emailData.newEmail === user.email) {
      setCredentialsError('New email must be different from your current email')
      return
    }

    setCredentialsLoading(true)

    try {
      await apiRequest('/auth/change-email', {
        method: 'PUT',
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password
        })
      })

      setCredentialsSuccess('Email changed successfully! Please login again with your new email.')
      
      setTimeout(() => {
        localStorage.removeItem('token')
        if (setUser) setUser(null)
        navigate('/login')
      }, 2000)
    } catch (err) {
      setCredentialsError(err.message || 'Failed to change email')
    } finally {
      setCredentialsLoading(false)
    }
  }

  if (checking) {
    return <div className="container">Loading...</div>
  }

  const setupHelperText = setupStep === 'profile' ? t('setupProgress.step1Helper') : null

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      {/* Back to Dashboard Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary" 
        style={{ marginBottom: '20px' }}
      >
        ← Back to Dashboard
      </button>

      {setupStep === 'profile' && setupHelperText && (
        <div style={{
          padding: '15px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, color: '#92400E', fontSize: '14px', lineHeight: '1.6' }}>
            <strong>💡 {t('setupProgress.helperTitle')}:</strong><br />
            {setupHelperText}
          </p>
        </div>
      )}

      <div className="card">
        <h1>My Profile</h1>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '2px solid #E5E7EB'
        }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile')
              setError('')
              setSuccess('')
            }}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'profile' ? '#2563EB' : '#475569',
              cursor: 'pointer',
              fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
              marginBottom: '-2px'
            }}
          >
            Business Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('credentials')
              setCredentialsError('')
              setCredentialsSuccess('')
            }}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'credentials' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'credentials' ? '#2563EB' : '#475569',
              cursor: 'pointer',
              fontWeight: activeTab === 'credentials' ? 'bold' : 'normal',
              marginBottom: '-2px'
            }}
          >
            Change Credentials
          </button>
        </div>

        {/* Business Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              {hasProfile 
                ? 'Update your business information'
                : 'Set up your provider profile to start offering services'
              }
            </p>
            
            {error && <div className="error">{error}</div>}
            
            {success && (
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                {success}
              </div>
            )}

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
            <label>Business Image/Logo</label>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    // Check file size (limit to 2MB for better performance)
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Image is too large. Please use an image smaller than 2MB. You can compress it using an online tool or resize it before uploading.')
                      e.target.value = ''
                      return
                    }
                    
                    // Load image and show cropper for adjustment
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setImageToCrop(reader.result)
                      setShowCropper(true)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                style={{ marginBottom: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>OR</strong> Paste an image URL:
            </div>
            <input
              type="url"
              name="business_image_url"
              value={formData.business_image_url && formData.business_image_url.startsWith('http') ? formData.business_image_url : ''}
              onChange={(e) => {
                const url = e.target.value
                if (url && url.startsWith('http')) {
                  // Load the image from URL and show cropper
                  const img = new Image()
                  img.crossOrigin = 'anonymous'
                  img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0)
                    setImageToCrop(canvas.toDataURL('image/jpeg'))
                    setShowCropper(true)
                  }
                  img.onerror = () => {
                    // If loading fails, just set the URL directly (will use as-is)
                    handleChange(e)
                  }
                  img.src = url
                } else {
                  handleChange(e)
                }
              }}
              placeholder="https://example.com/your-business-logo.jpg"
            />
            <small style={{ color: '#475569', marginTop: '5px', display: 'block' }}>
              Upload an image file or paste a URL. You can adjust how it appears in the circle. 
              Recommended: Square image (500x500px or larger) for best results. Max file size: 2MB.
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
                    border: '2px solid #E5E7EB'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div style={{ display: 'none', color: '#DC2626', fontSize: '12px', marginTop: '5px' }}>
                  Image failed to load. Please check the URL or try uploading again.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, business_image_url: '' })
                    const fileInput = document.querySelector('input[type="file"]')
                    if (fileInput) fileInput.value = ''
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove Image
                </button>
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
                border: '1px solid #2563EB',
                textAlign: 'center'
              }}>
                <a
                  href={`/${formData.business_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '20px',
                    color: '#2563EB',
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
                  color: '#475569', 
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
              <small style={{ color: '#475569', marginTop: '10px', display: 'block' }}>
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
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
              To send booking confirmation emails to your customers, you need to provide your email app password.
              <strong> Your email address ({user.email}) will be used to send emails.</strong>
            </p>

            <div className="form-group">
              <label>Email Service Type</label>
              <select
                name="email_service_type"
                value={formData.email_service_type}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #E5E7EB', width: '100%' }}
              >
                <option value="gmail">Gmail</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Email App Password <span style={{ color: '#999', fontSize: '12px' }}>(Optional but recommended)</span>
              </label>
              <PasswordInput
                name="email_password"
                value={formData.email_password}
                onChange={handleChange}
                placeholder={formData.email_service_type === 'gmail' ? 'Gmail App Password (16 characters)' : 'Email password or API key'}
                style={{ fontFamily: 'monospace' }}
              />
              <small style={{ display: 'block', color: '#475569', marginTop: '5px', fontSize: '12px' }}>
                {formData.email_service_type === 'gmail' ? (
                  <>
                    <strong>For Gmail:</strong> You need a Gmail App Password (not your regular password).
                    <br />
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2563EB' }}
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
                border: '1px solid #F59E0B'
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
          </>
        )}

        {/* Change Credentials Tab */}
        {activeTab === 'credentials' && (
          <>
            {credentialsError && <div className="error">{credentialsError}</div>}
            {credentialsSuccess && (
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                {credentialsSuccess}
              </div>
            )}

            {/* Credentials Sub-tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '30px',
              borderBottom: '2px solid #E5E7EB'
            }}>
              <button
                type="button"
                onClick={() => {
                  setCredentialsTab('password')
                  setCredentialsError('')
                  setCredentialsSuccess('')
                }}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: credentialsTab === 'password' ? '2px solid #2563EB' : '2px solid transparent',
                  color: credentialsTab === 'password' ? '#2563EB' : '#475569',
                  cursor: 'pointer',
                  fontWeight: credentialsTab === 'password' ? 'bold' : 'normal',
                  marginBottom: '-2px'
                }}
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentialsTab('email')
                  setCredentialsError('')
                  setCredentialsSuccess('')
                }}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: credentialsTab === 'email' ? '2px solid #2563EB' : '2px solid transparent',
                  color: credentialsTab === 'email' ? '#2563EB' : '#475569',
                  cursor: 'pointer',
                  fontWeight: credentialsTab === 'email' ? 'bold' : 'normal',
                  marginBottom: '-2px'
                }}
              >
                Change Email
              </button>
            </div>

            {credentialsTab === 'password' ? (
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <PasswordInput
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <PasswordInput
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <PasswordInput
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    placeholder="Re-enter your new password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={credentialsLoading} 
                  style={{ width: '100%' }}
                >
                  {credentialsLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label>Current Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ 
                      backgroundColor: '#f3f4f6', 
                      cursor: 'not-allowed',
                      color: '#6b7280'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>New Email</label>
                  <input
                    type="email"
                    name="newEmail"
                    value={emailData.newEmail}
                    onChange={handleEmailChange}
                    required
                    placeholder="Enter your new email address"
                  />
                </div>

                <div className="form-group">
                  <label>Current Password</label>
                  <PasswordInput
                    name="password"
                    value={emailData.password}
                    onChange={handleEmailChange}
                    required
                    placeholder="Enter your current password to confirm"
                  />
                  <small style={{ color: '#475569', marginTop: '5px', display: 'block' }}>
                    You must enter your current password to change your email address.
                  </small>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={credentialsLoading} 
                  style={{ width: '100%' }}
                >
                  {credentialsLoading ? 'Changing...' : 'Change Email'}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={(croppedImage) => {
            setFormData({
              ...formData,
              business_image_url: croppedImage
            })
            setShowCropper(false)
            setImageToCrop(null)
          }}
          onCancel={() => {
            setShowCropper(false)
            setImageToCrop(null)
            const fileInput = document.querySelector('input[type="file"]')
            if (fileInput) fileInput.value = ''
          }}
        />
      )}
    </div>
  )
}

export default ProviderProfile


