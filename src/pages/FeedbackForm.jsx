import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

function FeedbackForm() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Check if feedback already exists for this appointment
    const checkFeedback = async () => {
      try {
        const data = await apiRequest(`/feedback/check/${appointmentId}`)
        if (data.exists) {
          setAlreadySubmitted(true)
        }
        // Also fetch booking details if needed
      } catch (err) {
        console.error('Error checking feedback:', err)
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) {
      checkFeedback()
    } else {
      setLoading(false)
    }
  }, [appointmentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating < 1 || rating > 5) {
      setError(t('feedback.rating') + ' ' + t('common.required').toLowerCase())
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          appointment_id: parseInt(appointmentId),
          rating,
          comment: comment.trim() || null
        })
      })

      // Show success message and navigate back
      alert(t('feedback.thankYou'))
      navigate(-1) // Go back to previous page
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div>{t('common.loading')}</div>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LanguageToggle />
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>{t('feedback.alreadySubmitted')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {t('feedback.alreadySubmittedMessage')}
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← {t('common.back')}
      </button>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>{t('feedback.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
          {t('feedback.description')}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: '500' }}>
              {t('feedback.rating')} <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '32px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: rating >= star ? '#FFD700' : 'var(--text-secondary)',
                    borderColor: rating >= star ? '#FFD700' : 'var(--border)',
                    transform: rating >= star ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!rating || rating < star) {
                      e.target.style.transform = 'scale(1.1)'
                      e.target.style.borderColor = '#FFD700'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!rating || rating < star) {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.borderColor = 'var(--border)'
                    }
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-secondary)' }}>
                {rating === 1 && t('feedback.poor')}
                {rating === 2 && t('feedback.fair')}
                {rating === 3 && t('feedback.good')}
                {rating === 4 && t('feedback.veryGood')}
                {rating === 5 && t('feedback.excellent')}
              </p>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="comment" style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
              {t('feedback.comment')}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('feedback.description')}
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              maxLength={500}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px', textAlign: 'right' }}>
              {comment.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || rating < 1}
            >
              {submitting ? t('feedback.submitting') : t('feedback.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackForm

