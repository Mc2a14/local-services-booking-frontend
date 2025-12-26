import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Check if current time is after sunset (simplified - assumes sunset around 6-7 PM)
  const shouldBeDarkMode = () => {
    const hour = new Date().getHours()
    // Between 6 PM (18) and 6 AM (6) consider it dark
    return hour >= 18 || hour < 6
  }

  // Check localStorage first, then check if it's after sunset
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      return saved
    }
    
    // If no saved preference, check if it's after sunset
    if (shouldBeDarkMode()) {
      return 'dark'
    }
    
    return 'light'
  }

  const [theme, setTheme] = useState(getInitialTheme)

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Check for sunset every hour (optional - can be removed if too heavy)
  useEffect(() => {
    const checkSunset = () => {
      // Only auto-switch if user hasn't manually set a preference recently
      const lastManualToggle = localStorage.getItem('lastThemeToggle')
      if (!lastManualToggle) {
        const shouldBeDark = shouldBeDarkMode()
        if ((shouldBeDark && theme === 'light') || (!shouldBeDark && theme === 'dark')) {
          setTheme(shouldBeDark ? 'dark' : 'light')
        }
      }
    }

    // Check on mount
    checkSunset()

    // Check every hour
    const interval = setInterval(checkSunset, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('lastThemeToggle', Date.now().toString())
      return newTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

