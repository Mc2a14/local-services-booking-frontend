import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { checkSetupProgress } from '../utils/setupProgress'
import { useLanguage } from '../contexts/LanguageContext'

function SetupProgress({ onComplete }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const [setupData, setSetupData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showHelper, setShowHelper] = useState(false)

  useEffect(() => {
    loadSetupProgress()
  }, [location.pathname, t]) // Reload when navigating or language changes

  const loadSetupProgress = async () => {
    setLoading(true)
    const data = await checkSetupProgress()
    setSetupData(data)
    setLoading(false)

    // Show helper message if navigating from dashboard with a step ID
    const urlParams = new URLSearchParams(window.location.search)
    const stepId = urlParams.get('setup')
    if (stepId && data && !data.isComplete) {
      const step = data.steps.find(s => s.id === stepId)
      if (step && !step.completed) {
        setShowHelper(true)
        // Scroll to top to see helper message
        window.scrollTo({ top: 0, behavior: 'smooth' })
        // Auto-hide after 10 seconds
        setTimeout(() => setShowHelper(false), 10000)
      }
    }
  }

  const handleStepClick = (step) => {
    if (!step.completed && step.route) {
      // Navigate to the page with setup parameter
      navigate(`${step.route}?setup=${step.id}`)
      // Trigger reload to show helper
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  if (loading || !setupData) {
    return null
  }

  // Don't show if setup is complete
  if (setupData.isComplete) {
    if (onComplete) {
      onComplete()
    }
    return null
  }

  const requiredSteps = setupData.steps.slice(0, 4)

  return (
    <div className="card" style={{ 
      marginBottom: '30px',
      border: '2px solid #2563EB',
      backgroundColor: '#f0f7ff'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          margin: '0 0 10px 0', 
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🚀 {t('setupProgress.title')}
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 'normal',
            color: '#64748B',
            marginLeft: 'auto'
          }}>
            {setupData.completedSteps}/{setupData.totalSteps} {t('setupProgress.complete')}
          </span>
        </h2>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: '#E2E8F0',
          borderRadius: '6px',
          overflow: 'hidden',
          marginTop: '15px'
        }}>
          <div style={{
            width: `${setupData.progress}%`,
            height: '100%',
            backgroundColor: '#2563EB',
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Helper message if navigating from setup */}
      {showHelper && setupData.steps.find(s => s.id === new URLSearchParams(window.location.search).get('setup')) && (
        <div style={{
          padding: '15px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, color: '#92400E', fontSize: '14px', lineHeight: '1.6' }}>
            <strong>💡 {t('setupProgress.helperTitle')}</strong><br />
            {(() => {
              const step = setupData.steps.find(s => s.id === new URLSearchParams(window.location.search).get('setup'))
              return step?.helperTextKey ? t(step.helperTextKey) : step?.helperText || ''
            })()}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {requiredSteps.map((step) => (
          <div
            key={step.id}
            onClick={() => handleStepClick(step)}
            style={{
              padding: '15px',
              borderRadius: '8px',
              border: step.completed ? '2px solid #10B981' : '2px solid #E2E8F0',
              backgroundColor: step.completed ? '#F0FDF4' : 'white',
              cursor: step.completed ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}
            onMouseEnter={(e) => {
              if (!step.completed) {
                e.currentTarget.style.borderColor = '#2563EB'
                e.currentTarget.style.backgroundColor = '#F0F7FF'
              }
            }}
            onMouseLeave={(e) => {
              if (!step.completed) {
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.backgroundColor = 'white'
              }
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: step.completed ? '#10B981' : '#E2E8F0',
              color: step.completed ? 'white' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {step.completed ? '✓' : step.number}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '600',
                color: step.completed ? '#10B981' : '#1E293B',
                marginBottom: '4px'
              }}>
                {t('setupProgress.stepLabel').replace('{{number}}', step.number)}: {step.titleKey ? t(step.titleKey) : step.title}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748B'
              }}>
                {step.descriptionKey ? t(step.descriptionKey) : step.description}
              </div>
            </div>
            {!step.completed && (
              <div style={{
                color: '#2563EB',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {t('setupProgress.clickToComplete')}
              </div>
            )}
          </div>
        ))}
      </div>

      {setupData.isComplete && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#10B981',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🎉 {t('setupProgress.allComplete')}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {t('setupProgress.readyMessage')}
          </p>
        </div>
      )}
    </div>
  )
}

export default SetupProgress

