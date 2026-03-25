import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}

type AuthAction =
  | { type: 'LOGIN'; payload: { accessToken: string; refreshToken: string; user: User } }
  | { type: 'REFRESH'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: (() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })(),
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      }
    case 'REFRESH':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      }
    case 'LOGOUT':
      return { accessToken: null, refreshToken: null, user: null }
    default:
      return state
  }
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, refreshToken: string, user: User) => void
  refreshTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    if (state.accessToken) {
      localStorage.setItem('accessToken', state.accessToken)
      localStorage.setItem('user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
    if (state.refreshToken) {
      localStorage.setItem('refreshToken', state.refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }, [state.accessToken, state.refreshToken, state.user])

  const login = (accessToken: string, refreshToken: string, user: User) =>
    dispatch({ type: 'LOGIN', payload: { accessToken, refreshToken, user } })

  const refreshTokens = (accessToken: string, refreshToken: string) =>
    dispatch({ type: 'REFRESH', payload: { accessToken, refreshToken } })

  const logout = () => dispatch({ type: 'LOGOUT' })

  return (
    <AuthContext.Provider value={{ ...state, login, refreshTokens, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
