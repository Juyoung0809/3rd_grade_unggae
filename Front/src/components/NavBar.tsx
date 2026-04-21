import { type ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

interface NavBarProps {
  /** 헤더 중앙에 렌더링할 검색바 등 (선택) */
  centerSlot?: ReactNode
}

export default function NavBar({ centerSlot }: NavBarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const linkCls = (path: string) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive(path)
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
    }`

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-3">
        {/* ── 로고 ── */}
        <button
          onClick={() => navigate('/courses')}
          className="font-extrabold text-xl tracking-tight text-indigo-600 hover:text-indigo-700 transition-colors shrink-0 mr-2"
        >
          Edit<span className="text-slate-800">Hub</span>
        </button>

        {/* ── 데스크톱 왼쪽 네비 ── */}
        <nav className="hidden md:flex items-center gap-1">
          <button onClick={() => navigate('/courses')} className={linkCls('/courses')}>
            홈
          </button>
          {user && (
            <>
              <button onClick={() => navigate('/my/enrollments')} className={linkCls('/my/enrollments')}>
                내 강의
              </button>
              <button onClick={() => navigate('/my/payments')} className={linkCls('/my/payments')}>
                결제 내역
              </button>
              {user.role === 'INSTRUCTOR' && (
                <button onClick={() => navigate('/instructor/courses')} className={linkCls('/instructor/courses')}>
                  강의 관리
                </button>
              )}
              {user.role === 'ADMIN' && (
                <button onClick={() => navigate('/admin')} className={linkCls('/admin')}>
                  관리자
                </button>
              )}
            </>
          )}
        </nav>

        {/* ── 중앙 슬롯 (검색바 등) ── */}
        {centerSlot && (
          <div className="flex-1 hidden sm:block">{centerSlot}</div>
        )}
        {!centerSlot && <div className="flex-1" />}

        {/* ── 데스크톱 오른쪽 사용자 메뉴 ── */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className={`text-sm font-medium px-3 py-2 border border-slate-200 rounded-lg transition-colors ${isActive('/profile') ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : 'text-slate-500 bg-slate-50 hover:text-indigo-600 hover:bg-indigo-50'}`}
              >
                {user.nickname}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors rounded-lg hover:bg-indigo-50"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                무료로 시작하기
              </button>
            </>
          )}
        </div>

        {/* ── 모바일 햄버거 버튼 ── */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── 모바일 드롭다운 메뉴 ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <button
            onClick={() => { navigate('/courses'); setMobileMenuOpen(false) }}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/courses') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            홈
          </button>

          {user && (
            <>
              <button
                onClick={() => { navigate('/my/enrollments'); setMobileMenuOpen(false) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/my/enrollments') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                내 강의
              </button>
              <button
                onClick={() => { navigate('/my/payments'); setMobileMenuOpen(false) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/my/payments') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                결제 내역
              </button>
              {user.role === 'INSTRUCTOR' && (
                <button
                  onClick={() => { navigate('/instructor/courses'); setMobileMenuOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/instructor/courses') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  강의 관리
                </button>
              )}
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => { navigate('/admin'); setMobileMenuOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/admin') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  관리자
                </button>
              )}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-3">
                <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false) }}
                  className="text-sm text-slate-700 font-medium hover:text-indigo-600">
                  {user.nickname}
                </button>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                  className="text-sm text-red-500 font-medium">
                  로그아웃
                </button>
              </div>
            </>
          )}

          {!user && (
            <div className="pt-2 flex gap-2">
              <button onClick={() => { navigate('/auth'); setMobileMenuOpen(false) }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                로그인
              </button>
              <button onClick={() => { navigate('/auth'); setMobileMenuOpen(false) }}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                회원가입
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
