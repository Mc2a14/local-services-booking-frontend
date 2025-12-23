// Use Railway URL if provided, otherwise use proxy (for local dev)
// To use Railway: Create .env file with VITE_API_URL=https://your-app.up.railway.app/api
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const getToken = () => {
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    // Include status code in error message for better error handling
    const error = new Error(data.error || 'Something went wrong')
    error.status = response.status
    throw error
  }

  return data
}

