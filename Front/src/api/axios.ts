import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response.data.data,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = res.data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        original.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
