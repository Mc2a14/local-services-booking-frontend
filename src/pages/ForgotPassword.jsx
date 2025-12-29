import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = verify, 2 = reset password
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiRequest('/auth/verify-for-reset', {
        method: 'POST',
        body: JSON.stringify({ 
          email: formData.email, 
          phone: formData.phone 
        })
      })

      // Verification successful, move to password reset step
      setStep(2)
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your email and phone number.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
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

    setLoading(true)

    try {
      await apiRequest('/auth/reset-password-verified', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      })

      // Success - redirect to login
      alert('Password reset successfully! Please login with your new password.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>Reset Password</h1>
        
        {error && <div className="error">{error}</div>}
        
        {step === 1 ? (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              Verify your email and phone number to reset your password.
            </p>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="555-123-4567"
                  style={{ marginBottom: '5px' }}
                />
                <small style={{ color: '#475569', fontSize: '12px', display: 'block' }}>
                  Enter the phone number associated with your account (if you provided one)
                </small>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ width: '100%' }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              Verification successful! Please enter your new password.
            </p>

            <form onSubmit={handleResetPassword}>
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

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                disabled={loading}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Back
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

