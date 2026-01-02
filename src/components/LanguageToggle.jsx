import { useLanguage } from '../contexts/LanguageContext'

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="language-toggle"
      aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      title={`Switch to ${language === 'en' ? 'Español' : 'English'}`}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '14px',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--bg-secondary)'
        e.target.style.borderColor = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent'
        e.target.style.borderColor = 'var(--border)'
      }}
    >
      <span style={{ fontSize: '16px' }}>
        {language === 'en' ? '🇺🇸' : '🇪🇸'}
      </span>
      <span>{language === 'en' ? 'EN' : 'ES'}</span>
    </button>
  )
}

export default LanguageToggle


