import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

function ChatWidget({ businessSlug, businessName, inline = false, defaultOpen = false, onSuggestBooking, services = [] }) {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chat.greeting')
    }
  ])

  // Update greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: t('chat.greeting') }])
    }
  }, [language, t])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
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
    // Only scroll within the messages container - never the page
    if (messagesContainerRef.current) {
      // Scroll only the container internally
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
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

  // Don't auto-focus input - let user focus manually
  // This prevents any page scrolling or jumping
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
    }
  }, [])

  // No input focus scrolling - input stays visible in container
  const handleInputFocus = () => {
    // Do nothing - chat container handles visibility
    // Input is fixed at bottom of container, always visible
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
          business_slug: businessSlug,
          language: language
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

      // Suggest booking if relevant
      if (shouldSuggestBooking(data.response, userMessage)) {
        setTimeout(() => {
          setMessages([
            ...updatedMessages,
            {
              role: 'assistant',
              content: `${t('chat.suggestionTitle')} ${t('chat.suggestionMessage')}`,
              isSuggestion: true
            }
          ])
          // Trigger booking modal via callback
          if (onSuggestBooking) {
            onSuggestBooking()
          }
        }, 1000) // Small delay to feel natural
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
                content: t('chat.error')
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
            aria-label={t('chat.openChat')}
            >
              💬 {t('chat.chatWithAI')}
            </button>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {t('chat.chatDescription')}
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
        position: 'relative', // Always relative - no floating
        width: '100%',
        maxWidth: inline ? '100%' : '380px',
        height: inline ? '500px' : '500px', // Fixed height for stability
        maxHeight: '70vh', // Limit max height to viewport
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border)',
        marginBottom: inline ? '20px' : '0',
        // Prevent page scroll interference
        overflow: 'hidden',
        // iOS safe area
        touchAction: 'manipulation'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--btn-ai)',
          color: 'var(--btn-ai-text)',
          padding: '8px 12px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('chat.chatWithAI')}</div>
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
          aria-label={t('chat.closeChat')}
        >
          ×
        </button>
      </div>

      {/* Messages - Scrollable area */}
      <div
        ref={messagesContainerRef}
        className="chat-messages-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 12px 6px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: 0,
          alignItems: 'flex-start',
          textAlign: 'left',
          // iOS smooth scrolling
          WebkitOverflowScrolling: 'touch',
          // Ensure proper scrolling behavior
          overscrollBehavior: 'contain'
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
                💡 {t('chat.suggestionHint')}
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
              {t('chat.thinking')}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Always visible at bottom of container */}
      <form
        onSubmit={sendMessage}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '10px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-primary)',
          // Always at bottom - never moves
          position: 'relative',
          zIndex: 1
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={t('chat.typeMessage')}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            fontSize: '16px',
            outline: 'none',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            minHeight: '44px',
            // Prevent any browser scroll behavior
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
          {t('chat.send')}
        </button>
      </form>
    </div>
  )
}

export default ChatWidget

