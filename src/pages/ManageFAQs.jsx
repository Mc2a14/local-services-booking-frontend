import { useState, useEffect } from 'react'
import { apiRequest } from '../utils/auth'

function ManageFAQs() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    try {
      setLoading(true)
      const data = await apiRequest('/faqs')
      setFaqs(data.faqs || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingFAQ) {
        // Update existing FAQ
        await apiRequest(`/faqs/${editingFAQ.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
      } else {
        // Create new FAQ
        await apiRequest('/faqs', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
      }

      // Reset form and reload FAQs
      setFormData({
        question: '',
        answer: '',
        display_order: faqs.length,
        is_active: true
      })
      setShowForm(false)
      setEditingFAQ(null)
      loadFAQs()
    } catch (err) {
      setError(err.message || 'Failed to save FAQ')
    }
  }

  const handleEdit = (faq) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return
    }

    try {
      await apiRequest(`/faqs/${faqId}`, {
        method: 'DELETE'
      })
      loadFAQs()
    } catch (err) {
      setError(err.message || 'Failed to delete FAQ')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingFAQ(null)
    setFormData({
      question: '',
      answer: '',
      display_order: faqs.length,
      is_active: true
    })
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div>Loading FAQs...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Manage FAQs</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingFAQ(null)
              setFormData({
                question: '',
                answer: '',
                display_order: faqs.length,
                is_active: true
              })
              setShowForm(true)
            }}
            disabled={showForm && !editingFAQ}
          >
            + Add FAQ
          </button>
        </div>

        <p style={{ color: '#475569', marginBottom: '30px' }}>
          Add frequently asked questions and answers that will help the AI customer service assist your customers better. 
          The AI will use these FAQs to provide accurate and consistent answers.
        </p>

        {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8f9fa' }}>
            <h2>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  rows="2"
                  placeholder="e.g., What are your business hours?"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #E5E7EB' }}
                />
              </div>

              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows="4"
                  placeholder="e.g., We are open Monday through Friday from 9:00 AM to 5:00 PM, and Saturday from 10:00 AM to 2:00 PM."
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #E5E7EB' }}
                />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                  style={{ width: '100px', padding: '8px', borderRadius: '5px', border: '1px solid #E5E7EB' }}
                />
                <small style={{ display: 'block', color: '#475569', marginTop: '5px' }}>
                  Lower numbers appear first. Use this to control the order of FAQs.
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active (FAQ will be used by AI customer service)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </button>
                <button type="button" className="btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {faqs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#475569', marginBottom: '20px' }}>
              No FAQs yet. Click "Add FAQ" to get started!
            </p>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              FAQs help the AI customer service answer common questions accurately and consistently.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Your FAQs ({faqs.length})</h2>
            {faqs
              .sort((a, b) => a.display_order - b.display_order)
              .map((faq) => (
                <div
                  key={faq.id}
                  className="card"
                  style={{
                    marginBottom: '15px',
                    opacity: faq.is_active ? 1 : 0.6,
                    borderLeft: `4px solid ${faq.is_active ? '#2563EB' : '#ccc'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      {!faq.is_active && (
                        <span style={{ 
                          display: 'inline-block', 
                          backgroundColor: '#ccc', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '3px', 
                          fontSize: '12px',
                          marginBottom: '10px'
                        }}>
                          INACTIVE
                        </span>
                      )}
                      <h3 style={{ marginBottom: '10px', color: '#0F172A' }}>Q: {faq.question}</h3>
                      <p style={{ color: '#475569', marginBottom: '10px', lineHeight: '1.6' }}>
                        A: {faq.answer}
                      </p>
                      <small style={{ color: '#999' }}>
                        Order: {faq.display_order} | Created: {new Date(faq.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                      <button
                        className="btn"
                        onClick={() => handleEdit(faq)}
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDelete(faq.id)}
                        style={{ 
                          fontSize: '14px', 
                          padding: '8px 16px',
                          backgroundColor: '#DC2626',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageFAQs




