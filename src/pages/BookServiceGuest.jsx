import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

function BookServiceGuest() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [service, setService] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  useEffect(() => {
    if (serviceId) {
      loadService()
    } else {
      setError(t('errors.serviceNotFound'))
      setLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    if (selectedDate && service) {
      loadAvailableSlots()
    }
  }, [selectedDate, service])

  const loadService = async () => {
    try {
      const url = `${API_URL}/services/${serviceId}`
      console.log('Fetching service from:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `Failed to load service: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Service data received:', data)
      
      if (!data.service) {
        throw new Error('Service not found in response')
      }
      setService(data.service)
    } catch (err) {
      console.error('Error loading service:', err)
      setError(err.message || t('errors.serviceNotFound'))
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      const data = await fetch(`${API_URL}/availability/${service.provider_id}/slots?date=${selectedDate}`)
        .then(res => res.json())
      setAvailableSlots(data.available_slots || [])
    } catch (err) {
      console.error('Error loading slots:', err)
      setAvailableSlots([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // Validation
    if (!customerName.trim()) {
      setError(t('validation.required').replace('This field', t('common.name')))
      setSubmitting(false)
      return
    }

    if (!customerEmail.trim()) {
      setError(t('validation.required').replace('This field', t('common.email')))
      setSubmitting(false)
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError(t('validation.invalidEmail'))
      setSubmitting(false)
      return
    }

    if (!selectedDate || !selectedTime) {
      setError(t('validation.mustSelectDate') + ' ' + t('validation.mustSelectTime').toLowerCase())
      setSubmitting(false)
      return
    }

    try {
      // Combine date and time
      const bookingDate = new Date(`${selectedDate}T${selectedTime}`).toISOString()
      
      const response = await fetch(`${API_URL}/bookings/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: parseInt(serviceId),
          booking_date: bookingDate,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim() || null,
          notes: notes.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('errors.bookingFailed'))
      }

      // Store booking details for display (use backend response, fallback to form data)
      setBookingDetails({
        ...data.booking,
        customer_name: data.booking.customer_name || customerName.trim(),
        customer_email: data.booking.customer_email || customerEmail.trim(),
        customer_phone: data.booking.customer_phone || customerPhone.trim() || null,
        service_title: data.booking.service_title || service.title,
        business_name: data.booking.business_name || service.business_name || null,
        business_slug: data.booking.business_slug || null
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || t('errors.bookingFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '40px' }}>
        <div>{t('common.loading')}</div>
      </div>
    )
  }

  if (!service && error) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LanguageToggle />
        </div>
        <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          ← {t('common.backToHome')}
        </button>
        <div className="card">
          <h1 style={{ color: '#DC2626' }}>{t('errors.serviceNotFound')}</h1>
          <p style={{ color: '#475569', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#475569', marginBottom: '20px' }}>
            {t('errors.serviceNotFound')}
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LanguageToggle />
        </div>
        <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          ← {t('common.backToHome')}
        </button>
        <div className="card">
          <h1 style={{ color: '#DC2626' }}>{t('errors.serviceNotFound')}</h1>
          <p style={{ color: '#475569', marginBottom: '20px' }}>
            {t('errors.serviceNotFound')}
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    )
  }

  if (success && bookingDetails) {
    const bookingDate = new Date(bookingDetails.booking_date)
    const locale = language === 'es' ? 'es-ES' : 'en-US'
    const formattedDate = bookingDate.toLocaleDateString(locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const formattedTime = bookingDate.toLocaleTimeString(locale, { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })

    const getStatusLabel = (status) => {
      return t(`booking.${status}`) || status
    }

    return (
      <div className="container" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LanguageToggle />
        </div>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ color: '#16A34A', marginBottom: '10px' }}>{t('booking.bookingConfirmed')}</h1>
            <p style={{ fontSize: '18px', color: '#475569' }}>
              {t('booking.thankYou')}, {bookingDetails.customer_name}!
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '25px', 
            borderRadius: '10px', 
            marginBottom: '30px' 
          }}>
            <h2 style={{ marginBottom: '20px', color: '#0F172A' }}>{t('booking.bookingDetails')}</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.bookingId')}:</strong>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563EB' }}>#{bookingDetails.id}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.service')}:</strong>
              <span style={{ fontSize: '18px' }}>{bookingDetails.service_title}</span>
            </div>

            {bookingDetails.business_name && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.business')}:</strong>
                <span style={{ fontSize: '18px', color: '#2563EB' }}>{bookingDetails.business_name}</span>
              </div>
            )}

            {bookingDetails.price && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('common.price')}:</strong>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB' }}>
                  ${parseFloat(bookingDetails.price).toFixed(2)}
                </span>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.dateTime')}:</strong>
              <span style={{ fontSize: '18px' }}>
                {formattedDate} {language === 'es' ? 'a las' : 'at'} {formattedTime}
              </span>
            </div>

            {bookingDetails.duration_minutes && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('common.duration')}:</strong>
                <span style={{ fontSize: '18px' }}>{bookingDetails.duration_minutes} {t('common.minutes')}</span>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('common.status')}:</strong>
              <span style={{ 
                fontSize: '16px', 
                padding: '5px 15px', 
                borderRadius: '5px',
                backgroundColor: bookingDetails.status === 'pending' ? '#fff3cd' : '#d4edda',
                color: bookingDetails.status === 'pending' ? '#856404' : '#155724',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {getStatusLabel(bookingDetails.status)}
              </span>
            </div>

            {bookingDetails.customer_phone && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.yourPhone')}:</strong>
                <span style={{ fontSize: '18px' }}>{bookingDetails.customer_phone}</span>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.yourEmail')}:</strong>
              <span style={{ fontSize: '18px' }}>{bookingDetails.customer_email}</span>
            </div>

            {bookingDetails.notes && (
              <div style={{ marginTop: '20px' }}>
                <strong style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>{t('booking.notes')}:</strong>
                <span style={{ fontSize: '16px', fontStyle: 'italic' }}>{bookingDetails.notes}</span>
              </div>
            )}
          </div>

          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '30px',
            border: '1px solid #b3d9ff'
          }}>
            <p style={{ margin: 0, color: '#004085' }}>
              <strong>📧 {t('booking.confirmationMessage')}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                // Navigate back to the business booking page using business_slug
                const businessSlug = bookingDetails.business_slug || service?.business_slug;
                if (businessSlug) {
                  navigate(`/${businessSlug}`)
                } else {
                  navigate('/')
                }
              }} 
              className="btn btn-primary" 
              style={{ padding: '12px 30px' }}
            >
              {t('booking.backToHome')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <LanguageToggle />
      </div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← {t('common.back')}
      </button>

      <div className="card">
        <h1>{t('booking.title')}</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2>{service.title}</h2>
          {service.business_name && (
            <p style={{ color: '#2563EB', fontWeight: 'bold', marginBottom: '10px' }}>
              {service.business_name}
            </p>
          )}
          <p style={{ color: '#475569', marginBottom: '10px' }}>{service.description}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>
            ${service.price}
          </p>
          {service.average_rating && (
            <p>⭐ {service.average_rating} ({service.review_count} reviews)</p>
          )}
        </div>

        <p style={{ marginBottom: '20px', color: '#475569' }}>
          {t('booking.confirmationMessage')}
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px', paddingBottom: '25px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ marginBottom: '15px' }}>{t('booking.yourInfo')}</h3>
            
            <div className="form-group">
              <label>{t('common.name')} *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder={t('common.name')}
              />
            </div>

            <div className="form-group">
              <label>{t('common.email')} *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                placeholder={t('common.email')}
              />
              <small style={{ color: '#475569', marginTop: '5px', display: 'block' }}>
                {t('booking.confirmationMessage')}
              </small>
            </div>

            <div className="form-group">
              <label>{t('booking.phone')}</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t('common.phone')}
              />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ marginBottom: '15px' }}>{t('booking.bookingDetails')}</h3>
            
            <div className="form-group">
              <label>{t('booking.selectDate')} *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedTime('')
                }}
                min={today}
                max={maxDateStr}
                required
              />
            </div>

            {selectedDate && availableSlots.length > 0 && (
              <div className="form-group">
                <label>{t('booking.selectTime')} *</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                >
                  <option value="">{t('booking.selectTime')}...</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedDate && availableSlots.length === 0 && (
              <div className="error" style={{ marginBottom: '15px' }}>
                {t('errors.loadFailed')}
              </div>
            )}

            <div className="form-group">
              <label>{t('booking.notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder={t('booking.notes')}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || !selectedDate || !selectedTime || availableSlots.length === 0}
            style={{ width: '100%', padding: '15px', fontSize: '18px' }}
          >
            {submitting ? t('common.loading') : t('booking.bookButton')}
          </button>

          <p style={{ marginTop: '20px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
            {t('booking.confirmationMessage')}
          </p>
        </form>
      </div>
    </div>
  )
}

export default BookServiceGuest

