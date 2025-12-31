import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

function Home() {
  const navigate = useNavigate()
  const [businessSlug, setBusinessSlug] = useState('')
  const token = getToken()
  const { t } = useLanguage()

  const handleBusinessSlugSubmit = (e) => {
    e.preventDefault()
    if (businessSlug.trim()) {
      navigate(`/${businessSlug.trim()}`)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid var(--accent)'
      }}>
        <h1 style={{ margin: 0, color: 'var(--accent)' }}>{t('home.title')}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <LanguageToggle />
          {token ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                {t('common.dashboard')}
              </button>
              <button onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/'
              }} className="btn btn-secondary">
                {t('common.logout')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-secondary">
                {t('common.login')}
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                {t('common.getStarted')}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section for Business Owners */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '50px',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#2563EB' }}>
          {t('home.subtitle')}
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#475569', maxWidth: '700px', margin: '0 auto 30px' }}>
          {t('home.description')}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/register')} 
            className="btn btn-primary"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            {t('common.getStarted')}
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-secondary"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            {t('common.login')}
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '30px',
        marginBottom: '50px'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
          <h3>{t('home.easyBooking')}</h3>
          <p style={{ color: '#475569' }}>
            {t('home.easyBookingDesc')}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
          <h3>{t('home.aiReceptionist')}</h3>
          <p style={{ color: '#475569' }}>
            {t('home.aiReceptionistDesc')}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
          <h3>{t('home.emailConfirmations')}</h3>
          <p style={{ color: '#475569' }}>
            {t('home.emailConfirmationsDesc')}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔗</div>
          <h3>{t('home.yourOwnLink')}</h3>
          <p style={{ color: '#475569' }}>
            {t('home.yourOwnLinkDesc')}
          </p>
        </div>
      </div>

      {/* For Customers Section */}
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>{t('home.findBusiness')}</h2>
        <p style={{ color: '#475569', marginBottom: '30px' }}>
          {t('home.description')}
        </p>
        <form onSubmit={handleBusinessSlugSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={businessSlug}
              onChange={(e) => setBusinessSlug(e.target.value)}
              placeholder={t('home.enterBusinessSlug')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '5px'
              }}
            />
            <button type="submit" className="btn btn-primary">
              {t('home.search')}
            </button>
          </div>
          <small style={{ display: 'block', marginTop: '10px', color: '#475569' }}>
            {t('home.example')}
          </small>
        </form>
      </div>
    </div>
  )
}

export default Home
