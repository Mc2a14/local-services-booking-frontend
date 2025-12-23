import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function AddService({ user }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration_minutes: '',
    image_url: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes)
        })
      })
      navigate('/')
    } catch (err) {
      // Show helpful error message
      if (err.message.includes('Provider profile') || err.message.includes('Not Found')) {
        setError('Provider profile not found. Please create your provider profile first. Click "My Profile" in the navigation.')
      } else {
        setError(err.message || 'Failed to add service. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back
      </button>

      <div className="card">
        <h1>Add New Service</h1>
        
        {error && (
          <div className="error">
            {error}
            {error.includes('Provider profile') && (
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={() => navigate('/provider-profile')} 
                  className="btn btn-primary"
                >
                  Go to My Profile
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Emergency Plumbing Repair"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your service..."
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g., Plumbing, Electrical, Cleaning"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="150.00"
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                min="1"
                placeholder="90"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Adding Service...' : 'Add Service'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddService

