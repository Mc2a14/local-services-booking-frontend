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
      // Prepare data for API - convert empty strings to null and parse numbers
      const serviceData = {
        title: formData.title.trim() || null,
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
        image_url: formData.image_url.trim() || null
      }

      await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData)
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
            <label>Service Image (Optional)</label>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    // Check file size (limit to 2MB for better performance)
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Image is too large. Please use an image smaller than 2MB. You can compress it using an online tool or resize it before uploading.')
                      e.target.value = ''
                      return
                    }
                    
                    // Compress image before converting to base64
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      const img = new Image()
                      img.onload = () => {
                        // Create canvas to resize/compress
                        const canvas = document.createElement('canvas')
                        const MAX_WIDTH = 1200
                        const MAX_HEIGHT = 800
                        let width = img.width
                        let height = img.height
                        
                        // Calculate new dimensions
                        if (width > height) {
                          if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                          }
                        } else {
                          if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                          }
                        }
                        
                        canvas.width = width
                        canvas.height = height
                        const ctx = canvas.getContext('2d')
                        ctx.drawImage(img, 0, 0, width, height)
                        
                        // Convert to base64 with compression (0.85 quality)
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
                        setFormData({
                          ...formData,
                          image_url: compressedDataUrl
                        })
                      }
                      img.src = reader.result
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
              Upload an image file or paste a URL. Recommended: 800x600px or larger. Max file size: 2MB (images will be automatically compressed).
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

