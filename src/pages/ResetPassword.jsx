import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!token) {
      setError('Invalid reset link')
      return
    }

    setLoading(true)

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        })
      })

      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be expired or invalid.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
        <div className="card">
          <h1 style={{ marginBottom: '20px' }}>Invalid Reset Link</h1>
          <div className="error" style={{ marginBottom: '20px' }}>
            The password reset link is invalid or missing. Please request a new password reset.
          </div>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>Reset Password</h1>
        
        {error && <div className="error">{error}</div>}
        
        {success ? (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <strong>✓ Password reset successfully!</strong>
            <p style={{ margin: '10px 0 0 0' }}>
              Your password has been changed. Redirecting to login page...
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Re-enter your password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ width: '100%' }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword


