import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest, setToken } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

function Register({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    user_type: 'customer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguage()

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
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      setToken(data.token)
      setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>{t('register.title')}</h1>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('register.fullName')}</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('register.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('register.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>{t('register.phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('register.userType')}</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
            >
              <option value="customer">{t('register.customer')}</option>
              <option value="provider">{t('register.provider')}</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? t('common.loading') : t('register.registerButton')}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          {t('register.haveAccount')} <Link to="/login">{t('register.loginHere')}</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

