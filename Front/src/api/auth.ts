import api from './axios'

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'STUDENT' | 'INSTRUCTOR'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    name: string
    role: string
  }
}

export const register = (data: RegisterRequest): Promise<void> =>
  api.post('/api/auth/register', data)

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  api.post('/api/auth/login', data)
