import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>Forgot Password</h1>
        
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
            <strong>✓ Email sent!</strong>
            <p style={{ margin: '10px 0 0 0' }}>
              If an account with that email exists, a password reset link has been sent. 
              Please check your email and follow the instructions to reset your password.
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              <strong>Note:</strong> The reset link will expire in 1 hour.
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ width: '100%' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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

