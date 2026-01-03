import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import PasswordInput from '../components/PasswordInput'

function ForgotPassword() {
  const navigate = useNavigate()
  const { t } = useLanguage()
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
      setError(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('resetPassword.passwordsDoNotMatch'))
      return
    }

    if (formData.newPassword.length < 6) {
      setError(t('validation.passwordTooShort'))
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
      alert(t('resetPassword.success'))
      navigate('/login')
    } catch (err) {
      setError(err.message || t('errors.generic'))
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>{t('forgotPassword.title')}</h1>
        
        {error && <div className="error">{error}</div>}
        
        {step === 1 ? (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              {t('forgotPassword.description')}
            </p>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label>{t('common.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('common.email')}
                />
              </div>

              <div className="form-group">
                <label>{t('common.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('common.phone')}
                  style={{ marginBottom: '5px' }}
                  inputMode="tel"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ width: '100%' }}
              >
                {loading ? t('common.loading') : t('forgotPassword.submit')}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              {t('resetPassword.title')}
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>{t('resetPassword.newPassword')}</label>
                <PasswordInput
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder={t('validation.passwordTooShort')}
                />
              </div>

              <div className="form-group">
                <label>{t('resetPassword.confirmPassword')}</label>
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder={t('resetPassword.confirmPassword')}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ width: '100%' }}
              >
                {loading ? t('common.loading') : t('resetPassword.submit')}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                disabled={loading}
                style={{ width: '100%', marginTop: '10px' }}
              >
                {t('common.back')}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          {t('login.noAccount')} <Link to="/login">{t('common.login')}</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

