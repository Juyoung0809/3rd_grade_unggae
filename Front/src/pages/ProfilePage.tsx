import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import { getMyProfile, updateMyProfile, updatePassword } from '../api/users'
import type { UserProfile } from '../api/users'

const ROLE_LABEL: Record<string, string> = {
  STUDENT: '수강생',
  INSTRUCTOR: '강사',
  ADMIN: '관리자',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editNickname, setEditNickname] = useState('')
  const [editBio, setEditBio] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyProfile()
      setProfile(data)
      setEditNickname(data.nickname)
      setEditBio(data.bio ?? '')
    } catch {
      setError('프로필을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!editNickname.trim()) return
    setProfileLoading(true)
    setProfileSuccess(false)
    try {
      const updated = await updateMyProfile({ nickname: editNickname.trim(), bio: editBio })
      setProfile(updated)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 2000)
    } catch {
      alert('프로필 변경에 실패했습니다.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (newPassword.length < 8) {
      setPwError('새 비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }
    setPwLoading(true)
    try {
      await updatePassword({ currentPassword, newPassword })
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setPwSuccess(false), 2000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPwError(msg ?? '비밀번호 변경에 실패했습니다.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-lg mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">내 프로필</h1>

        {loading ? (
          <div className="text-center py-20 text-slate-400">불러오는 중...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : profile ? (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">기본 정보</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">이메일</span>
                  <span className="text-slate-700 font-medium">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">역할</span>
                  <span className="text-slate-700 font-medium">{ROLE_LABEL[profile.role] ?? profile.role}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">가입일</span>
                  <span className="text-slate-700 font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 프로필 수정 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">프로필 수정</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">닉네임</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="닉네임 입력"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">자기소개</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    placeholder="자기소개를 입력하세요 (선택)"
                  />
                </div>
                {profileSuccess && (
                  <p className="text-sm text-green-600">프로필이 변경되었습니다.</p>
                )}
                <button
                  type="submit"
                  disabled={profileLoading || !editNickname.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {profileLoading ? '저장 중...' : '저장'}
                </button>
              </form>
            </div>

            {/* 비밀번호 변경 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">비밀번호 변경</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="현재 비밀번호"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="새 비밀번호 (8자 이상)"
                />
                {pwError && <p className="text-sm text-red-500">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-green-600">비밀번호가 변경되었습니다.</p>}
                <button
                  type="submit"
                  disabled={pwLoading || !currentPassword || !newPassword}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {pwLoading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
