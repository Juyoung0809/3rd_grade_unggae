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

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regNickname, setRegNickname] = useState('')
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
      await registerApi({ email: regEmail, password: regPassword, nickname: regNickname, role: regRole })
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
    <div className="min-h-screen flex">
      {/* ── 왼쪽 브랜드 패널 ── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white">
        <button
          onClick={() => navigate('/courses')}
          className="font-extrabold text-2xl tracking-tight text-white hover:text-indigo-200 transition-colors text-left w-fit"
        >
          Edit<span className="text-indigo-200">Hub</span>
        </button>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight mb-3">
              영상 편집의<br />
              <span className="text-yellow-300">모든 것을 배우세요</span>
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed">
              유튜브, 쇼츠, 모션그래픽, 색보정, 썸네일까지<br />
              현직 전문가의 실무 강의가 당신을 기다립니다.
            </p>
          </div>

          <div className="space-y-4">
            {[
              '5가지 분야의 전문 강의',
              '평균 4.8점 수강생 만족도',
              '언제 어디서나 반복 수강',
              '강사에게 직접 질문하기',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-indigo-100 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-xs">© 2025 EditHub. All rights reserved.</p>
      </div>

      {/* ── 오른쪽 폼 패널 ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* 모바일 로고 */}
        <button
          onClick={() => navigate('/courses')}
          className="lg:hidden font-extrabold text-2xl text-indigo-600 mb-8"
        >
          Edit<span className="text-slate-800">Hub</span>
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
              {tab === 'login' ? '다시 만나서 반가워요!' : '지금 시작하세요!'}
            </h1>
            <p className="text-sm text-slate-500">
              {tab === 'login' ? '계정에 로그인하여 학습을 이어가세요' : '무료로 가입하고 강의를 둘러보세요'}
            </p>
          </div>

          {/* 탭 */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {/* 에러 */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors mt-2 shadow-md shadow-indigo-200"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">닉네임</label>
                <input
                  type="text"
                  value={regNickname}
                  onChange={(e) => setRegNickname(e.target.value)}
                  required
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="8자 이상 입력"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">가입 유형</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['STUDENT', 'INSTRUCTOR'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRegRole(role)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        regRole === role
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {role === 'STUDENT' ? '수강생' : '강사'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors mt-2 shadow-md shadow-indigo-200"
              >
                {loading ? '처리 중...' : '무료로 시작하기'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-5">
            {tab === 'login' ? (
              <>아직 계정이 없으신가요?{' '}
                <button onClick={() => { setTab('register'); setError('') }} className="text-indigo-600 font-semibold hover:underline">
                  회원가입
                </button>
              </>
            ) : (
              <>이미 계정이 있으신가요?{' '}
                <button onClick={() => { setTab('login'); setError('') }} className="text-indigo-600 font-semibold hover:underline">
                  로그인
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
