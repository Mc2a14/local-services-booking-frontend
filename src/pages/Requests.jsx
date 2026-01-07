import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function Requests({ user }) {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      // TODO: Replace with actual API endpoint when backend is implemented
      // For now, show placeholder
      setRequests([])
    } catch (err) {
      console.error('Error loading requests:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsResolved = async (requestId) => {
    try {
      // TODO: Implement when backend is ready
      alert('Mark as resolved - coming soon!')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Customer Requests</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            Questions and requests from customers that need your attention
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="card">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>📥 No requests yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            When customers ask questions that the AI cannot answer, or when they request human assistance, 
            those messages will appear here for you to review and respond to.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {requests.map(request => (
            <div key={request.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ marginBottom: '5px' }}>{request.customer_name || 'Anonymous Customer'}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <span style={{ 
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: request.status === 'resolved' ? 'var(--success-soft)' : 'var(--warning-soft)',
                  color: request.status === 'resolved' ? 'var(--success)' : 'var(--warning)',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {request.status === 'resolved' ? '✓ Resolved' : '⚠️ Pending'}
                </span>
              </div>
              
              <div style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                padding: '15px', 
                borderRadius: '5px', 
                marginBottom: '15px',
                borderLeft: '3px solid var(--accent)'
              }}>
                <p style={{ fontWeight: '500', marginBottom: '8px' }}>Customer Question:</p>
                <p style={{ color: 'var(--text-primary)' }}>{request.question}</p>
              </div>

              {request.ai_response && (
                <div style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  padding: '15px', 
                  borderRadius: '5px', 
                  marginBottom: '15px' 
                }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>AI Response:</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{request.ai_response}</p>
                </div>
              )}

              {request.customer_email && (
                <p style={{ marginBottom: '10px' }}>
                  <strong>Contact:</strong> {request.customer_email}
                  {request.customer_phone && ` | ${request.customer_phone}`}
                </p>
              )}

              {request.status !== 'resolved' && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => markAsResolved(request.id)}
                    className="btn btn-primary"
                  >
                    ✓ Mark as Resolved
                  </button>
                  {request.customer_email && (
                    <button
                      onClick={() => window.location.href = `mailto:${request.customer_email}`}
                      className="btn btn-secondary"
                    >
                      📧 Reply via Email
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Requests





