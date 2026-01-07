import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or browser preference
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('language')
    if (saved === 'en' || saved === 'es') {
      return saved
    }
    
    // Try to detect browser language
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang.startsWith('es')) {
      return 'es'
    }
    
    // Default to English
    return 'en'
  }

  const [language, setLanguage] = useState(getInitialLanguage)
  const [translations, setTranslations] = useState({})

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translationModule = await import(`../translations/${language}.json`)
        setTranslations(translationModule.default || translationModule)
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error)
        // Fallback to English if translation file is missing
        if (language !== 'en') {
          try {
            const englishTranslations = await import('../translations/en.json')
            setTranslations(englishTranslations.default || englishTranslations)
          } catch (e) {
            console.error('Failed to load English translations:', e)
          }
        }
      }
    }

    loadTranslations()
  }, [language])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'es') {
      setLanguage(lang)
    }
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en')
  }

  // Translation function
  const t = (key, defaultValue = '') => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return defaultValue || key
      }
    }
    
    return typeof value === 'string' ? value : (defaultValue || key)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}




