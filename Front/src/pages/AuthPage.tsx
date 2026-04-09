import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login as loginApi, register as registerApi } from '../api/auth'
import { useAuth } from '../store/AuthContext'

type Tab = 'login' | 'register'

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/courses'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regRole, setRegRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT')

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginApi({ email: loginEmail, password: loginPassword })
      login(data.accessToken, data.refreshToken, data.user)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerApi({ email: regEmail, password: regPassword, name: regName, role: regRole })
      setTab('login')
      setLoginEmail(regEmail)
      setLoginPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">EditHub</h1>
            <button
              onClick={() => navigate('/courses')}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              홈으로
            </button>
          </div>
          <p className="text-sm text-gray-500">영상편집 강의 플랫폼</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-8">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`pb-3 mr-6 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <div className="px-8 py-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="비밀번호 입력"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="홍길동"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="8자 이상 입력"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as 'STUDENT' | 'INSTRUCTOR')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="STUDENT">수강생</option>
                  <option value="INSTRUCTOR">강사</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? '처리 중...' : '회원가입'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
