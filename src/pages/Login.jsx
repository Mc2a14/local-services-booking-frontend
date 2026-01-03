import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest, setToken } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import PasswordInput from '../components/PasswordInput'

function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      setToken(data.token)
      setUser(data.user)
      
      // Check for redirect parameter
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect) {
        navigate(redirect)
      } else {
        // Redirect to appropriate dashboard
        navigate(data.user.user_type === 'provider' ? '/dashboard' : '/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>{t('login.title')}</h1>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ marginBottom: 0 }}>{t('login.password')}</label>
              <Link 
                to="/forgot-password" 
                style={{ 
                  fontSize: '14px', 
                  color: '#2563EB', 
                  textDecoration: 'none' 
                }}
              >
                {t('login.forgotPassword')}
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? t('common.loading') : t('login.loginButton')}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          {t('login.noAccount')} <Link to="/register">{t('login.registerHere')}</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

