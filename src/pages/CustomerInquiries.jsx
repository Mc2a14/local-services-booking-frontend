import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'

function CustomerInquiries() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  useEffect(() => {
    loadInquiries()
  }, [statusFilter])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      setError('')
      const url = statusFilter === 'all' ? '/inquiries' : `/inquiries?status=${statusFilter}`
      const data = await apiRequest(url)
      setInquiries(data.inquiries || [])
    } catch (err) {
      console.error('Error loading inquiries:', err)
      setError(err.message || t('inquiries.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      await apiRequest(`/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
      // Reload inquiries
      loadInquiries()
      // Close detail view if open
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(null)
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err)
      alert(err.message || t('inquiries.errorUpdate'))
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'new':
        return { bg: 'var(--primary)', text: 'white' }
      case 'contacted':
        return { bg: '#f59e0b', text: 'white' }
      case 'followed_up':
        return { bg: '#10b981', text: 'white' }
      default:
        return { bg: 'var(--text-secondary)', text: 'white' }
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return t('inquiries.newStatus')
      case 'contacted':
        return t('inquiries.contactedStatus')
      case 'followed_up':
        return t('inquiries.followedUpStatus')
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <div>{t('common.loading')}</div>
      </div>
    )
  }

  if (error && inquiries.length === 0) {
    return (
      <div className="container" style={{ padding: '40px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--error-bg, #fee)', 
          borderRadius: '8px',
          color: 'var(--error-text, #c33)',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          {t('common.backToDashboard')}
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {t('inquiries.title')}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'} {statusFilter !== 'all' && `(${t(`inquiries.${statusFilter}Status`)})`}
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          {t('common.backToDashboard')}
        </button>
      </div>

      {/* Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setStatusFilter('all')}
          className={statusFilter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          {t('inquiries.allStatuses')}
        </button>
        <button
          onClick={() => setStatusFilter('new')}
          className={statusFilter === 'new' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          {t('inquiries.newStatus')}
        </button>
        <button
          onClick={() => setStatusFilter('contacted')}
          className={statusFilter === 'contacted' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          {t('inquiries.contactedStatus')}
        </button>
        <button
          onClick={() => setStatusFilter('followed_up')}
          className={statusFilter === 'followed_up' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          {t('inquiries.followedUpStatus')}
        </button>
      </div>

      {/* Inquiries List */}
      {inquiries.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {t('inquiries.noInquiries')}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            {t('inquiries.noInquiriesDesc')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {inquiries.map((inquiry) => {
            const statusColor = getStatusBadgeColor(inquiry.status)
            return (
              <div
                key={inquiry.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedInquiry?.id === inquiry.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => setSelectedInquiry(selectedInquiry?.id === inquiry.id ? null : inquiry)}
                onMouseEnter={(e) => {
                  if (selectedInquiry?.id !== inquiry.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedInquiry?.id !== inquiry.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px' }}>
                        {inquiry.customer_name || t('inquiries.name')}
                      </h3>
                      <span
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {getStatusLabel(inquiry.status)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {inquiry.customer_email && (
                        <div>📧 {inquiry.customer_email}</div>
                      )}
                      {inquiry.customer_phone && (
                        <div>📞 {inquiry.customer_phone}</div>
                      )}
                      {inquiry.inquiry_message && (
                        <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontStyle: 'italic' }}>
                          "{inquiry.inquiry_message}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div>{formatDate(inquiry.created_at)}</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedInquiry?.id === inquiry.id && (
                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {t('inquiries.inquiryDetails')}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
                      {inquiry.customer_name && (
                        <div>
                          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('inquiries.name')}</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{inquiry.customer_name}</div>
                        </div>
                      )}
                      {inquiry.customer_email && (
                        <div>
                          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('inquiries.email')}</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                            <a href={`mailto:${inquiry.customer_email}`} style={{ color: 'var(--primary)' }}>
                              {inquiry.customer_email}
                            </a>
                          </div>
                        </div>
                      )}
                      {inquiry.customer_phone && (
                        <div>
                          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('inquiries.phone')}</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                            <a href={`tel:${inquiry.customer_phone}`} style={{ color: 'var(--primary)' }}>
                              {inquiry.customer_phone}
                            </a>
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('inquiries.received')}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{formatDate(inquiry.created_at)}</div>
                      </div>
                    </div>

                    {inquiry.inquiry_message && (
                      <div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('inquiries.message')}</div>
                        <div style={{ 
                          color: 'var(--text-primary)', 
                          padding: '12px', 
                          backgroundColor: 'var(--bg-secondary)', 
                          borderRadius: '8px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {inquiry.inquiry_message}
                        </div>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '12px',
                      flexWrap: 'wrap'
                    }}>
                      {inquiry.status === 'new' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(inquiry.id, 'contacted')
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          {t('inquiries.markAsContacted')}
                        </button>
                      )}
                      {inquiry.status === 'contacted' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(inquiry.id, 'followed_up')
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          {t('inquiries.markAsFollowedUp')}
                        </button>
                      )}
                      {inquiry.status !== 'new' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(inquiry.id, 'new')
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          {t('inquiries.newStatus')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomerInquiries

