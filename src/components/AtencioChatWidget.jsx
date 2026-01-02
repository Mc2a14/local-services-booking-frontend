import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

function AtencioChatWidget() {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('atencioChat.greeting')
    }
  ])

  // Update greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: t('atencioChat.greeting') }])
    }
  }, [language, t])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
    }
  }, [])

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
      const response = await fetch(`${API_URL}/ai/atencio-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          language: language
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response
      const updatedMessages = [...newMessages, { role: 'assistant', content: data.reply }]
      setMessages(updatedMessages)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: t('atencioChat.error')
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    // Button to open chat - inline style
    return (
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
          transition: 'all 0.2s',
          marginBottom: '15px'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)'
        }}
        aria-label={t('atencioChat.openChat')}
      >
        💬 {t('atencioChat.buttonLabel')}
      </button>
    )
  }

  return (
    <div
      className="chat-widget-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        height: '500px',
        maxHeight: '70vh',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border)',
        marginBottom: '30px',
        overflow: 'hidden',
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
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('atencioChat.title')}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{t('atencioChat.subtitle')}</div>
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
          aria-label={t('atencioChat.closeChat')}
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
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0',
              width: '100%'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? 'var(--chat-user-bubble)' : 'var(--chat-ai-bubble)',
                color: message.role === 'user' ? 'var(--chat-user-text)' : 'var(--chat-ai-text)',
                wordWrap: 'break-word',
                fontSize: '15px',
                lineHeight: '1.35',
                marginBottom: '0',
                marginLeft: '0',
                marginRight: 'auto',
                textAlign: 'left',
                alignSelf: 'flex-start'
              }}
              dangerouslySetInnerHTML={{
                __html: message.content.replace(
                  /(to get started click here:)\s*(\/[\w-]+)/gi,
                  (match, text, path) => {
                    return `${text} <a href="${path}" style="color: var(--accent); text-decoration: underline; font-weight: 600; cursor: pointer;" onclick="event.preventDefault(); window.location.href='${path}'; return false;">${path}</a>`
                  }
                )
              }}
            >
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
                fontSize: '16px',
                marginLeft: '0',
                marginRight: 'auto'
              }}
            >
              {t('atencioChat.thinking')}
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
          position: 'relative',
          zIndex: 1
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('atencioChat.placeholder')}
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
          {t('atencioChat.send')}
        </button>
      </form>
    </div>
  )
}

export default AtencioChatWidget

