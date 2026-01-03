import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import PasswordInput from '../components/PasswordInput'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
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
      setError(t('errors.notFound'))
    }
  }, [token, t])

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
      setError(t('resetPassword.passwordsDoNotMatch'))
      return
    }

    if (formData.newPassword.length < 6) {
      setError(t('validation.passwordTooShort'))
      return
    }

    if (!token) {
      setError(t('errors.notFound'))
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
      setError(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LanguageToggle />
        </div>
        <div className="card">
          <h1 style={{ marginBottom: '20px' }}>{t('errors.notFound')}</h1>
          <div className="error" style={{ marginBottom: '20px' }}>
            {t('errors.notFound')}
          </div>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
            {t('forgotPassword.title')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>{t('resetPassword.title')}</h1>
        
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
            <strong>✓ {t('resetPassword.success')}</strong>
            <p style={{ margin: '10px 0 0 0' }}>
              {language === 'es' ? 'Tu contraseña ha sido cambiada. Redirigiendo a la página de inicio de sesión...' : 'Your password has been changed. Redirecting to login page...'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: '#475569', marginBottom: '30px' }}>
              {t('resetPassword.title')}
            </p>

            <form onSubmit={handleSubmit}>
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
            </form>
          </>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login">{t('common.back')} {t('common.login')}</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword


