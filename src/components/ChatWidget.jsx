import { useState, useRef, useEffect } from 'react'

function ChatWidget({ businessSlug, businessName, inline = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm here to help you with questions about ${businessName || 'this business'}. How can I assist you today?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async (e) => {
    e?.preventDefault()
    
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          business_slug: businessSlug
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or contact the business directly.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    if (inline) {
      // Inline button style - shown in the page flow
      return (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              borderRadius: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff'
              e.target.style.transform = 'translateY(0)'
            }}
            aria-label="Open chat"
          >
            💬 Ask {businessName || 'us'} a question
          </button>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Get instant answers about our services, hours, and more
          </p>
        </div>
      )
    }
    
    // Floating button style - bottom right corner
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Open chat"
      >
        💬
      </button>
    )
  }

  return (
    <div
      style={{
        position: inline ? 'relative' : 'fixed',
        bottom: inline ? 'auto' : '20px',
        right: inline ? 'auto' : '20px',
        width: inline ? '100%' : '380px',
        maxWidth: inline ? '100%' : 'calc(100vw - 40px)',
        height: inline ? '500px' : '500px',
        maxHeight: inline ? '500px' : 'calc(100vh - 40px)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        border: '1px solid #E5E7EB',
        marginBottom: inline ? '30px' : '0'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '16px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Chat with {businessName}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>AI Assistant</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? '#007bff' : '#f1f1f1',
                color: message.role === 'user' ? 'white' : '#0F172A',
                wordWrap: 'break-word',
                fontSize: '14px',
                lineHeight: '1.4'
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#E2E8F0',
                color: '#666',
                fontSize: '14px'
              }}
            >
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{
          padding: '12px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatWidget

