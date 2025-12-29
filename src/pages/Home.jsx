import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

function Home() {
  const navigate = useNavigate()
  const [businessSlug, setBusinessSlug] = useState('')
  const token = getToken()

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
        <h1 style={{ margin: 0, color: 'var(--accent)' }}>Atencio</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {token ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Dashboard
              </button>
              <button onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/'
              }} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-secondary">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                Get Started
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
          Your Booking Page + AI Receptionist
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#475569', maxWidth: '700px', margin: '0 auto 30px' }}>
          Give your customers a simple way to book your services online. 
          Include an AI assistant to answer common questions 24/7.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/register')} 
            className="btn btn-primary"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            Create Your Booking Page
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-secondary"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            Sign In
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
          <h3>Easy Booking</h3>
          <p style={{ color: '#475569' }}>
            Customers can book your services instantly, no account needed
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
          <h3>AI Receptionist</h3>
          <p style={{ color: '#475569' }}>
            AI-powered chat handles common questions automatically
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
          <h3>Email Confirmations</h3>
          <p style={{ color: '#475569' }}>
            Automatic email confirmations sent from your business email
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔗</div>
          <h3>Your Own Link</h3>
          <p style={{ color: '#475569' }}>
            Share your unique booking page link with customers
          </p>
        </div>
      </div>

      {/* For Customers Section */}
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Have a Booking Link?</h2>
        <p style={{ color: '#475569', marginBottom: '30px' }}>
          Enter your business booking link below to view available services
        </p>
        <form onSubmit={handleBusinessSlugSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={businessSlug}
              onChange={(e) => setBusinessSlug(e.target.value)}
              placeholder="your-business-name"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E7EB',
                borderRadius: '5px'
              }}
            />
            <button type="submit" className="btn btn-primary">
              Go to Booking Page
            </button>
          </div>
          <small style={{ display: 'block', marginTop: '10px', color: '#475569' }}>
            Example: If your link is atencio.app/joe-plumbing, enter "joe-plumbing"
          </small>
        </form>
      </div>
    </div>
  )
}

export default Home
