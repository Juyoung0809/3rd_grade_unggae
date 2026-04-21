import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import NavBar from '../components/NavBar'
import {
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllPayments,
  cancelPayment,
  type AdminUser,
  type AdminPayment,
} from '../api/admin'
import type { Course } from '../api/courses'

const CATEGORY_LABEL: Record<string, string> = {
  YOUTUBE: '유튜브 영상',
  SHORTS: '쇼츠 영상',
  POST_PRODUCTION: '영상 후반작업',
  ADVERTISEMENT: '광고·홍보 영상',
  AI: 'AI 영상',
  EVENT: '행사 영상',
  INDUSTRY: '업종별 영상',
  MOTION: '모션그래픽',
  MUSIC: '음악·음원',
  SOUND: '기타 음향·음악',
  COLOR: '색보정',
  THUMBNAIL: '썸네일',
  VLOG: '브이로그',
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: '수강생',
  INSTRUCTOR: '강사',
  ADMIN: '관리자',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  SUSPENDED: '정지',
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-green-600 bg-green-50',
  INACTIVE: 'text-slate-500 bg-slate-100',
  SUSPENDED: 'text-red-600 bg-red-50',
}

const METHOD_LABEL: Record<string, string> = { FREE: '무료', CARD: '카드' }
const PAYMENT_STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'text-emerald-600 bg-emerald-50',
  REFUNDED: 'text-slate-500 bg-slate-100',
}

type Tab = 'courses' | 'users' | 'payments'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('courses')

  // 강의 승인 상태
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [courseActionLoading, setCourseActionLoading] = useState<number | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)

  // 사용자 관리 상태
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [userActionLoading, setUserActionLoading] = useState<number | null>(null)

  // 결제 관리 상태
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [paymentActionLoading, setPaymentActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/', { replace: true })
      return
    }
    fetchPending()
  }, [user])

  useEffect(() => {
    if (tab === 'users' && users.length === 0) fetchUsers()
    if (tab === 'payments' && payments.length === 0) fetchPayments()
  }, [tab])

  async function fetchPending() {
    setCoursesLoading(true)
    setCoursesError(null)
    try {
      const data = await getPendingCourses()
      setCourses(data)
    } catch {
      setCoursesError('강의 목록을 불러오지 못했습니다.')
    } finally {
      setCoursesLoading(false)
    }
  }

  async function fetchUsers() {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch {
      setUsersError('회원 목록을 불러오지 못했습니다.')
    } finally {
      setUsersLoading(false)
    }
  }

  async function handleApprove(courseId: number) {
    setCourseActionLoading(courseId)
    try {
      await approveCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
    } catch {
      alert('승인 처리 중 오류가 발생했습니다.')
    } finally {
      setCourseActionLoading(null)
    }
  }

  async function handleReject(courseId: number) {
    if (!confirm('이 강의를 거절하시겠습니까?')) return
    setCourseActionLoading(courseId)
    try {
      await rejectCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
    } catch {
      alert('거절 처리 중 오류가 발생했습니다.')
    } finally {
      setCourseActionLoading(null)
    }
  }

  async function handleStatusChange(userId: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    setUserActionLoading(userId)
    try {
      const updated = await updateUserStatus(userId, status)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    } catch {
      alert('상태 변경에 실패했습니다.')
    } finally {
      setUserActionLoading(null)
    }
  }

  async function fetchPayments() {
    setPaymentsLoading(true); setPaymentsError(null)
    try { setPayments(await getAllPayments()) }
    catch { setPaymentsError('결제 목록을 불러오지 못했습니다.') }
    finally { setPaymentsLoading(false) }
  }

  async function handleCancelPayment(paymentId: number) {
    if (!confirm('이 결제를 취소(환불)하시겠습니까?')) return
    setPaymentActionLoading(paymentId)
    try {
      const updated = await cancelPayment(paymentId)
      setPayments(prev => prev.map(p => p.paymentId === paymentId ? updated : p))
    } catch { alert('결제 취소에 실패했습니다.') }
    finally { setPaymentActionLoading(null) }
  }

  async function handleRoleChange(userId: number, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
    if (!confirm(`이 회원의 역할을 ${ROLE_LABEL[role]}로 변경하시겠습니까?`)) return
    setUserActionLoading(userId)
    try {
      const updated = await updateUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    } catch {
      alert('역할 변경에 실패했습니다.')
    } finally {
      setUserActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">관리자 대시보드</h1>
        <p className="text-slate-500 mb-6">서비스 전반을 관리합니다.</p>

        {/* 탭 */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab('courses')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'courses' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            강의 승인
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            회원 관리
          </button>
          <button
            onClick={() => setTab('payments')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'payments' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            결제 관리
          </button>
        </div>

        {/* 강의 승인 탭 */}
        {tab === 'courses' && (
          <>
            <p className="text-slate-500 mb-4 text-sm">승인 대기 중인 강의를 검토하고 승인 또는 거절하세요.</p>
            {coursesLoading ? (
              <div className="text-center py-20 text-slate-400">불러오는 중...</div>
            ) : coursesError ? (
              <div className="text-center py-20 text-red-500">{coursesError}</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
                <p className="text-lg font-medium">승인 대기 중인 강의가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-5 items-start shadow-sm"
                  >
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-28 h-20 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <div className="w-28 h-20 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center text-slate-400 text-xs">
                        미리보기 없음
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-slate-800 text-lg leading-snug">{course.title}</h2>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {course.instructor.name} · {CATEGORY_LABEL[course.category] ?? course.category}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-indigo-600">
                          {course.price === 0 ? '무료' : `${course.price.toLocaleString()}원`}
                        </span>
                      </div>
                      {course.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{course.description}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleApprove(course.id)}
                          disabled={courseActionLoading === course.id}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {courseActionLoading === course.id ? '처리 중...' : '승인'}
                        </button>
                        <button
                          onClick={() => handleReject(course.id)}
                          disabled={courseActionLoading === course.id}
                          className="px-4 py-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {courseActionLoading === course.id ? '처리 중...' : '거절'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 회원 관리 탭 */}
        {tab === 'users' && (
          <>
            <p className="text-slate-500 mb-4 text-sm">전체 회원 목록을 조회하고 상태 및 역할을 관리합니다.</p>
            {usersLoading ? (
              <div className="text-center py-20 text-slate-400">불러오는 중...</div>
            ) : usersError ? (
              <div className="text-center py-20 text-red-500">{usersError}</div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
                <p className="text-lg font-medium">회원이 없습니다.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">닉네임</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">이메일</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">역할</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">상태</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">가입일</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{u.nickname}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={userActionLoading === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN')}
                            className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
                          >
                            <option value="STUDENT">수강생</option>
                            <option value="INSTRUCTOR">강사</option>
                            <option value="ADMIN">관리자</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[u.status] ?? 'text-slate-500 bg-slate-100'}`}>
                            {STATUS_LABEL[u.status] ?? u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {u.status !== 'ACTIVE' ? (
                              <button
                                onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                                disabled={userActionLoading === u.id}
                                className="px-2.5 py-1 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                              >
                                활성화
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(u.id, 'INACTIVE')}
                                disabled={userActionLoading === u.id}
                                className="px-2.5 py-1 text-xs font-semibold border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-md transition-colors disabled:opacity-50"
                              >
                                비활성화
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {/* 결제 관리 탭 */}
        {tab === 'payments' && (
          <>
            <p className="text-slate-500 mb-4 text-sm">전체 결제 내역을 조회하고 환불 처리할 수 있습니다.</p>
            {paymentsLoading ? (
              <div className="text-center py-20 text-slate-400">불러오는 중...</div>
            ) : paymentsError ? (
              <div className="text-center py-20 text-red-500">{paymentsError}</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
                <p className="text-lg font-medium">결제 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">결제자</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">강의</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">강사</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">금액</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">결제수단</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">상태</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">결제일</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => (
                      <tr key={p.paymentId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 text-xs">{p.userNickname}</p>
                          <p className="text-slate-400 text-xs">{p.userEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-32">
                          <p className="truncate">{p.courseTitle}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{p.instructorNickname}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 text-xs">
                          {Number(p.paidPrice) === 0 ? '무료' : `${Number(p.paidPrice).toLocaleString()}원`}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{METHOD_LABEL[p.method] ?? p.method}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLOR[p.status] ?? 'text-slate-500 bg-slate-100'}`}>
                            {p.status === 'COMPLETED' ? '완료' : p.status === 'REFUNDED' ? '환불' : p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(p.paidAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3">
                          {p.status === 'COMPLETED' && (
                            <button
                              onClick={() => handleCancelPayment(p.paymentId)}
                              disabled={paymentActionLoading === p.paymentId}
                              className="px-2.5 py-1 text-xs font-semibold border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {paymentActionLoading === p.paymentId ? '...' : '환불'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
