import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, getToken } from '../utils/auth'

function ChangeCredentials({ user, setUser }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('password') // 'password' or 'email'
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if not logged in
  if (!getToken()) {
    navigate('/login')
    return null
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const handleEmailChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      setSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailData.newEmail)) {
      setError('Invalid email format')
      return
    }

    if (emailData.newEmail === user.email) {
      setError('New email must be different from your current email')
      return
    }

    setLoading(true)

    try {
      await apiRequest('/auth/change-email', {
        method: 'PUT',
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password
        })
      })

      setSuccess('Email changed successfully! Please login again with your new email.')
      
      // Logout and redirect to login after 2 seconds
      setTimeout(() => {
        localStorage.removeItem('token')
        if (setUser) setUser(null)
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to change email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>Change Credentials</h1>
        
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
              setActiveTab('password')
              setError('')
              setSuccess('')
            }}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'password' ? '#2563EB' : '#475569',
              cursor: 'pointer',
              fontWeight: activeTab === 'password' ? 'bold' : 'normal',
              marginBottom: '-2px'
            }}
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email')
              setError('')
              setSuccess('')
            }}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'email' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'email' ? '#2563EB' : '#475569',
              cursor: 'pointer',
              fontWeight: activeTab === 'email' ? 'bold' : 'normal',
              marginBottom: '-2px'
            }}
          >
            Change Email
          </button>
        </div>

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

        {activeTab === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
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
              <input
                type="password"
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
              disabled={loading} 
              style={{ width: '100%' }}
            >
              {loading ? 'Changing...' : 'Change Password'}
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
              <input
                type="password"
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
              disabled={loading} 
              style={{ width: '100%' }}
            >
              {loading ? 'Changing...' : 'Change Email'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Back
          </button>
        </p>
      </div>
    </div>
  )
}

export default ChangeCredentials



