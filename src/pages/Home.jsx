import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import AtencioChatWidget from '../components/AtencioChatWidget'

function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const token = getToken()
  const { t } = useLanguage()
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchBusinesses(searchQuery.trim())
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    // Cleanup: Clear timer on unmount or when searchQuery changes
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const searchBusinesses = async (query) => {
    setIsSearching(true)
    try {
      const response = await fetch(`${API_URL}/public/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.businesses || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleBusinessClick = (businessSlug) => {
    navigate(`/${businessSlug}`)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
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

      {/* Atencio AI Assistant */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '50px',
        marginTop: '25px',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <AtencioChatWidget />
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

      {/* For Customers Section - Search Businesses */}
      <div className="card" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{t('home.findBusiness')}</h2>
        <p style={{ color: '#475569', marginBottom: '30px', textAlign: 'center', fontSize: '16px' }}>
          Search for a business by name to view their services and book appointments.
        </p>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a business name..."
              style={{
                width: '100%',
                padding: '14px 50px 14px 16px',
                fontSize: '16px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true)
                }
              }}
            />
            {isSearching && (
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}>
                Searching...
              </div>
            )}
          </div>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 100
            }}>
              {searchResults.map((business) => (
                <div
                  key={business.id}
                  onClick={() => handleBusinessClick(business.business_slug)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  {business.business_image_url ? (
                    <img
                      src={business.business_image_url}
                      alt={business.business_name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}>
                      🏢
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, marginBottom: '4px', color: '#111827', fontSize: '16px', fontWeight: '600' }}>
                      {business.business_name}
                    </h3>
                    {business.description && (
                      <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {business.description}
                      </p>
                    )}
                    {business.phone && (
                      <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                        📞 {business.phone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
            <div style={{
              marginTop: '16px',
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              No businesses found matching &quot;{searchQuery}&quot;. Try a different search term.
            </div>
          )}

          {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
            <div style={{
              marginTop: '8px',
              color: '#6b7280',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Type at least 2 characters to search
            </div>
          )}
        </div>

        {/* Click outside to close results */}
        {showResults && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99
            }}
            onClick={() => setShowResults(false)}
          />
        )}
      </div>
    </div>
  )
}

export default Home
