import { useState, useRef, useEffect } from 'react'

function ChatWidget({ businessSlug, businessName, inline = false, defaultOpen = false, onSuggestBooking, services = [] }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! Need help booking or have a question?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Detect if AI response suggests booking would be relevant
  const shouldSuggestBooking = (aiResponse, userMessage) => {
    const bookingKeywords = ['book', 'appointment', 'schedule', 'available', 'availability', 'session', 'time slot', 'reserve']
    const responseLower = aiResponse.toLowerCase()
    const userLower = userMessage.toLowerCase()
    
    // Check if user asked about booking/availability or AI mentioned it
    const mentionsBooking = bookingKeywords.some(keyword => 
      responseLower.includes(keyword) || userLower.includes(keyword)
    )
    
    // Check if response mentions services or scheduling
    const mentionsServices = responseLower.includes('service') || responseLower.includes('tutoring') || 
                            responseLower.includes('session') || responseLower.includes('class')
    
    return mentionsBooking || (mentionsServices && services.length > 0)
  }

  const scrollToBottom = () => {
    // Only scroll within the messages container, not the entire page
    if (messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.parentElement?.closest('.chat-messages-container')
      if (messagesContainer) {
        // Scroll the container, not the page
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      } else {
        // Fallback: use scrollIntoView but with block: 'nearest' to prevent page scroll
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      }
    }
  }

  // Track if this is the initial render to prevent scroll on page load
  const isInitialRender = useRef(true)

  useEffect(() => {
    // Don't scroll on initial render to prevent page jump
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Don't auto-focus on initial page load to prevent scroll
    // Only focus when user explicitly interacts with chat
    if (isOpen && inputRef.current && !isInitialRender.current) {
      const timer = setTimeout(() => {
        // Focus without scrolling
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
    // Mark initial render as complete after first render
    if (isInitialRender.current) {
      isInitialRender.current = false
    }
  }, [isOpen])

  // Scroll input into view when focused (so it's visible above keyboard)
  const handleInputFocus = (e) => {
    // Store current scroll position
    const currentScroll = window.scrollY
    
    // Wait a bit for keyboard to appear, then minimal scroll
    setTimeout(() => {
      if (inputRef.current) {
        // Get input position
        const inputRect = inputRef.current.getBoundingClientRect()
        
        // Estimate keyboard height (typically 250-300px on mobile)
        const keyboardHeight = window.innerHeight * 0.4 // ~40% of screen
        const visibleHeight = window.innerHeight - keyboardHeight
        
        // Only scroll if input is actually covered by keyboard
        // And only scroll a minimal amount - just enough to peek above keyboard
        if (inputRect.bottom > visibleHeight) {
          // Calculate how much is actually hidden
          const hiddenAmount = inputRect.bottom - visibleHeight
          
          // Scroll only a small amount - just enough to see the input slightly
          // Much less aggressive - only scroll 30% of what's needed
          const minimalScroll = hiddenAmount * 0.3
          const targetScroll = currentScroll + minimalScroll
          
          window.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth'
          })
        }
      }
    }, 200) // Shorter delay
  }

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
      const updatedMessages = [...newMessages, { role: 'assistant', content: data.response }]
      setMessages(updatedMessages)

      // Suggest booking if relevant (but don't auto-scroll - let user continue chatting)
      if (shouldSuggestBooking(data.response, userMessage)) {
        setTimeout(() => {
          setMessages([
            ...updatedMessages,
            {
              role: 'assistant',
              content: 'Would you like me to book this for you? I can guide you through availability and help you schedule a session.',
              isSuggestion: true
            }
          ])
          // Don't auto-scroll to services - let user continue chatting
          // User can scroll down manually if they want to see services
          // if (onSuggestBooking) {
          //   onSuggestBooking()
          // }
        }, 1000) // Small delay to feel natural
      }
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
            className="btn btn-ai"
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
            }}
            aria-label="Open chat"
          >
            💬 Chat with our AI assistant
          </button>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Get instant answers about our services, hours, and more
          </p>
        </div>
      )
    }
    
    // Floating button style - bottom right corner
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ai"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}
        aria-label="Open chat"
      >
        💬
      </button>
    )
  }

  return (
    <div
      className={`chat-widget-container ${inline ? 'chat-widget-mobile' : ''}`}
      style={{
        position: inline ? 'relative' : 'fixed',
        bottom: inline ? 'auto' : '20px',
        right: inline ? 'auto' : '20px',
        width: inline ? '100%' : '380px',
        maxWidth: inline ? '100%' : 'calc(100vw - 40px)',
        height: inline ? '368px' : '458px', // Reduced by 25% from 490px (490px * 0.75 = 368px)
        maxHeight: inline ? '368px' : 'calc(100vh - 40px)',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        border: '1px solid var(--border)',
        marginBottom: inline ? '20px' : '0'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--btn-ai)',
          color: 'var(--btn-ai-text)',
          padding: '8px 12px', // Reduced header padding
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Chat with our AI assistant</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{businessName}</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--btn-ai-text)',
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
        className="chat-messages-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px 6px 12px', // Slightly reduced padding
          display: 'flex',
          flexDirection: 'column',
          gap: '8px', // Slightly reduced gap
          minHeight: 0,
          alignItems: 'flex-start', // Ensure all content aligns left
          textAlign: 'left' // Force text alignment to left
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start', // Always align to left
              gap: message.isSuggestion ? '8px' : '0',
              width: '100%'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 12px', // Slightly reduced padding
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? 'var(--chat-user-bubble)' : 'var(--chat-ai-bubble)',
                color: message.role === 'user' ? 'var(--chat-user-text)' : 'var(--chat-ai-text)',
                wordWrap: 'break-word',
                fontSize: '15px',
                lineHeight: '1.35', // Slightly tighter line height
                border: message.isSuggestion ? '1px solid var(--ai-accent)' : 'none',
                marginBottom: '0',
                marginLeft: '0', // Ensure left alignment
                marginRight: 'auto', // Push to left
                textAlign: 'left', // Force text alignment to left
                alignSelf: 'flex-start' // Force container to align left
              }}
            >
              {message.content}
            </div>
            {message.isSuggestion && (
              <div style={{
                maxWidth: '85%',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                marginLeft: '0',
                marginRight: 'auto'
              }}>
                💡 Scroll down to see available services below
              </div>
            )}
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
                backgroundColor: 'var(--chat-ai-bubble)',
                color: 'var(--text-secondary)',
                fontSize: '16px', // Increased by 2px from 14px
                marginLeft: '0',
                marginRight: 'auto' // Push to left
              }}
            >
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Mobile Optimized */}
      <form
        onSubmit={sendMessage}
        style={{
          padding: '8px 10px', // Slightly reduced padding
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px', // Reduced padding
            border: '1px solid var(--border)',
            borderRadius: '20px', // Slightly smaller radius
            fontSize: '15px', // Slightly smaller font
            outline: 'none',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            minHeight: '38px', // Smaller input height
            touchAction: 'manipulation'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{
            padding: '12px 20px',
            minHeight: '44px',
            minWidth: '70px',
            borderRadius: '24px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
            fontSize: '15px',
            fontWeight: '600',
            flexShrink: 0
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatWidget

