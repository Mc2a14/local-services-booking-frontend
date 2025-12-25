import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function BookService({ user }) {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadService()
  }, [serviceId])

  useEffect(() => {
    if (selectedDate && service) {
      loadAvailableSlots()
    }
  }, [selectedDate, service])

  const loadService = async () => {
    try {
      const data = await apiRequest(`/services/${serviceId}`)
      setService(data.service)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      // Get provider ID from service
      const data = await apiRequest(`/availability/${service.provider_id}/slots?date=${selectedDate}`)
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

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time')
      setSubmitting(false)
      return
    }

    try {
      // Combine date and time
      const bookingDate = new Date(`${selectedDate}T${selectedTime}`).toISOString()
      
      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          service_id: parseInt(serviceId),
          booking_date: bookingDate,
          notes: notes
        })
      })

      navigate('/bookings')
    } catch (err) {
      setError(err.message)
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
    return <div className="container">Loading...</div>
  }

  if (!service) {
    return <div className="container">Service not found</div>
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back
      </button>

      <div className="card">
        <h1>Book Service</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2>{service.title}</h2>
          <p style={{ color: '#475569', marginBottom: '10px' }}>{service.description}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>
            ${service.price}
          </p>
          {service.average_rating && (
            <p>⭐ {service.average_rating} ({service.review_count} reviews)</p>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Date</label>
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
              <label>Select Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              >
                <option value="">Choose a time...</option>
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
              No available time slots for this date. Please select another date.
            </div>
          )}

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Any special instructions or notes..."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || !selectedDate || !selectedTime || availableSlots.length === 0}
            style={{ width: '100%' }}
          >
            {submitting ? 'Booking...' : 'Book Service'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookService


