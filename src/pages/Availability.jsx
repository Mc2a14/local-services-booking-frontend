import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../utils/auth'
import { useLanguage } from '../contexts/LanguageContext'

function Availability({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setupStep = searchParams.get('setup')
  const [availability, setAvailability] = useState([
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: true },
    { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: true },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: true },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: true },
    { day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: true },
    { day_of_week: 6, start_time: '', end_time: '', is_available: false },
    { day_of_week: 0, start_time: '', end_time: '', is_available: false },
  ])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const dayNames = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  }

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/availability')
      if (data.availability && data.availability.length > 0) {
        // Merge existing availability with default schedule
        const existing = {}
        data.availability.forEach(item => {
          existing[item.day_of_week] = item
        })
        
        const merged = availability.map(day => {
          if (existing[day.day_of_week]) {
            return {
              ...day,
              start_time: existing[day.day_of_week].start_time,
              end_time: existing[day.day_of_week].end_time,
              is_available: existing[day.day_of_week].is_available
            }
          }
          return day
        })
        
        setAvailability(merged)
      }
    } catch (err) {
      // It's ok if no availability is set yet
      console.log('No existing availability found')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (index, field, value) => {
    const updated = [...availability]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    
    // If unchecking available, clear times
    if (field === 'is_available' && !value) {
      updated[index].start_time = ''
      updated[index].end_time = ''
    }
    
    setAvailability(updated)
    setMessage('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      // Filter only available days and validate
      const toSave = availability
        .filter(day => day.is_available && day.start_time && day.end_time)
        .map(day => ({
          day_of_week: day.day_of_week,
          start_time: day.start_time,
          end_time: day.end_time,
          is_available: true
        }))

      if (toSave.length === 0) {
        setError('Please set at least one day as available with start and end times')
        setSaving(false)
        return
      }

      // Validate time ranges
      for (const day of toSave) {
        if (day.start_time >= day.end_time) {
          setError(`${dayNames[day.day_of_week]}: End time must be after start time`)
          setSaving(false)
          return
        }
      }

      await apiRequest('/availability', {
        method: 'POST',
        body: JSON.stringify({ availability: toSave })
      })

      setMessage('Availability schedule saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back
      </button>

      {setupStep === 'hours' && (
        <div style={{
          padding: '15px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, color: '#92400E', fontSize: '14px', lineHeight: '1.6' }}>
            <strong>💡 {t('setupProgress.helperTitle')}:</strong><br />
            {t('setupProgress.step3Helper')}
          </p>
        </div>
      )}

      <div className="card">
        <h1>Set Your Availability Schedule</h1>
        <p style={{ color: '#475569', marginBottom: '30px' }}>
          Set your weekly business hours. Customers will only be able to book during these times.
        </p>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '30px' }}>
            {availability.map((day, index) => (
              <div 
                key={day.day_of_week} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px', 
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: day.is_available ? '#f8f9fa' : '#fff',
                  borderRadius: '5px',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div style={{ width: '120px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={day.is_available}
                      onChange={(e) => handleChange(index, 'is_available', e.target.checked)}
                      style={{ marginRight: '10px', width: '18px', height: '18px' }}
                    />
                    <strong>{dayNames[day.day_of_week]}</strong>
                  </label>
                </div>

                {day.is_available && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '14px' }}>From:</label>
                      <input
                        type="time"
                        value={day.start_time}
                        onChange={(e) => handleChange(index, 'start_time', e.target.value)}
                        required={day.is_available}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #E5E7EB' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '14px' }}>To:</label>
                      <input
                        type="time"
                        value={day.end_time}
                        onChange={(e) => handleChange(index, 'end_time', e.target.value)}
                        required={day.is_available}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #E5E7EB' }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving || loading}
            style={{ width: '100%', padding: '15px', fontSize: '18px' }}
          >
            {saving ? 'Saving...' : 'Save Availability Schedule'}
          </button>
        </form>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
          <strong>💡 Tip:</strong> Make sure to set your availability before customers can book services. 
          Only time slots within these hours will be available for booking.
        </div>
      </div>
    </div>
  )
}

export default Availability




