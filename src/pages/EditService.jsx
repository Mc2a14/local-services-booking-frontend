import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../utils/auth'

function EditService({ user }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration_minutes: '',
    image_url: '',
    is_active: true
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    loadService()
  }, [id])

  const loadService = async () => {
    try {
      const data = await apiRequest(`/services/${id}`)
      setFormData({
        title: data.service.title || '',
        description: data.service.description || '',
        category: data.service.category || '',
        price: data.service.price || '',
        duration_minutes: data.service.duration_minutes || '',
        image_url: data.service.image_url || '',
        is_active: data.service.is_active !== undefined ? data.service.is_active : true
      })
    } catch (err) {
      setError('Failed to load service. ' + (err.message || ''))
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes)
        })
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to update service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card">
          <div>Loading service...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <div className="card">
        <h1>Edit Service</h1>
        
        {error && <div className="error">{error}</div>}

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
            <label>Service Image</label>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    // Check file size (limit to 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image is too large. Please use an image smaller than 5MB.')
                      e.target.value = ''
                      return
                    }
                    
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setFormData({
                        ...formData,
                        image_url: reader.result
                      })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                style={{ marginBottom: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>OR</strong> Paste an image URL:
            </div>
            <input
              type="url"
              name="image_url"
              value={formData.image_url && formData.image_url.startsWith('http') ? formData.image_url : ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
              Upload an image file or paste a URL. Recommended: 800x600px or larger. Max file size: 5MB.
            </small>
            {formData.image_url && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, image_url: '' })
                    const fileInput = document.querySelector('input[type="file"]')
                    if (fileInput) fileInput.value = ''
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Service is active (visible to customers)</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Updating Service...' : 'Update Service'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditService

