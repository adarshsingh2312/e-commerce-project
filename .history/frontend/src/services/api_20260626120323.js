import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT except for auth endpoints to avoid invalid token blocking signup/login
api.interceptors.request.use((config) => {
  const url = config.url || ''
  if (url.includes('/auth')) return config
  const token = localStorage.getItem('emart_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('emart_token')
      localStorage.removeItem('emart_user')
      // redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
export default api
