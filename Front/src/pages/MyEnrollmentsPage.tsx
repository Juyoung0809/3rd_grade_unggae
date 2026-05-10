import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyEnrollments, cancelEnrollment, type Enrollment } from '../api/enrollments'
import NavBar from '../components/NavBar'

export default function MyEnrollmentsPage() {
  const navigate = useNavigate()

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const [cancelTarget, setCancelTarget] = useState<Enrollment | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelChecked, setCancelChecked] = useState(false)

  useEffect(() => {
    async function fetchEnrollments() {
      setLoading(true)
      setError('')
      try {
        const data = await getMyEnrollments()
        setEnrollments(data)
      } catch {
        setError('강의 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchEnrollments()
  }, [])

  function openCancelModal(enrollment: Enrollment) {
    setCancelTarget(enrollment)
    setCancelReason('')
    setCancelChecked(false)
  }

  function closeCancelModal() {
    setCancelTarget(null)
    setCancelReason('')
    setCancelChecked(false)
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    const { courseId, coursePrice, progressPercent, enrolledAt } = cancelTarget
    const isPaid = coursePrice > 0
    const daysSince = (Date.now() - new Date(enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
    const canRefund = isPaid && progressPercent < 5 && daysSince <= 3

    if (isPaid && canRefund) {
      navigate('/my/refund', { state: { enrollment: cancelTarget, reason: cancelReason } })
      closeCancelModal()
      return
    }

    setCancellingId(courseId)
    closeCancelModal()
    try {
      await cancelEnrollment(courseId)
      setEnrollments((prev) => prev.filter((e) => e.courseId !== courseId))
    } catch {
      alert('수강 취소 중 오류가 발생했습니다.')
    } finally {
      setCancellingId(null)
    }
  }

  const completedCount = enrollments.filter((e) => e.progressPercent === 100).length
  const inProgressCount = enrollments.filter((e) => e.progressPercent > 0 && e.progressPercent < 100).length

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* ── 페이지 히어로 ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">학습 현황</p>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-5">내 강의</h1>

          {!loading && enrollments.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">전체</p>
                  <p className="text-lg font-extrabold text-slate-800 leading-none">{enrollments.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 rounded-xl">
                <div>
                  <p className="text-xs text-indigo-500">수강 중</p>
                  <p className="text-lg font-extrabold text-indigo-700 leading-none">{inProgressCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl">
                <div>
                  <p className="text-xs text-emerald-600">수료 완료</p>
                  <p className="text-lg font-extrabold text-emerald-700 leading-none">{completedCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-2 bg-slate-200 rounded w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && enrollments.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-700 font-semibold text-base mb-2">아직 신청한 강의가 없어요</p>
            <p className="text-slate-400 text-sm mb-6">관심 있는 강의를 찾아보세요</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200"
            >
              강의 둘러보기
            </button>
          </div>
        )}

        {!loading && enrollments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                className="course-card bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group"
              >
                {/* 썸네일 */}
                {enrollment.thumbnailUrl ? (
                  <img
                    src={enrollment.thumbnailUrl}
                    alt={enrollment.courseTitle}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-40 bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white text-lg font-extrabold">Edit<span className="text-indigo-200">Hub</span></span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h2 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug flex-1 group-hover:text-indigo-600 transition-colors">
                      {enrollment.courseTitle}
                    </h2>
                    {enrollment.progressPercent === 100 ? (
                      <span className="shrink-0 text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">수료</span>
                    ) : enrollment.progressPercent > 0 ? (
                      <span className="shrink-0 text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full">수강 중</span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{enrollment.instructorName}</p>

                  {/* 진도율 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">진도율</span>
                      <span className={`font-bold ${enrollment.progressPercent === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {enrollment.progressPercent}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          enrollment.progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); openCancelModal(enrollment) }}
                      disabled={cancellingId === enrollment.courseId}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 font-medium"
                    >
                      {cancellingId === enrollment.courseId ? '취소 중...' : '수강 취소'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── 수강 취소 모달 ── */}
      {cancelTarget && (() => {
        const isPaid = cancelTarget.coursePrice > 0
        const daysSince = (Date.now() - new Date(cancelTarget.enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
        const canRefund = isPaid && cancelTarget.progressPercent < 5 && daysSince <= 3
        const noRefund = isPaid && !canRefund

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeCancelModal}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-base font-bold text-slate-900 mb-1">수강 취소</h2>
              <p className="text-sm text-slate-500 mb-5 line-clamp-1">{cancelTarget.courseTitle}</p>

              {/* 취소 사유 */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">취소 사유 (선택)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="취소 사유를 입력해주세요"
                />
              </div>

              {/* 진도율 초기화 체크박스 */}
              <label className="flex items-start gap-2.5 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={cancelChecked}
                  onChange={(e) => setCancelChecked(e.target.checked)}
                  className="mt-0.5 accent-indigo-600"
                />
                <span className="text-sm text-slate-700">수강 취소 시 지금까지 시청한 진도율이 초기화됩니다.</span>
              </label>

              {/* 환불 안내 */}
              {noRefund && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
                  결제 후 3일이 초과되었거나 진도율이 5% 이상이어서 <strong>환불이 불가능</strong>합니다.
                </div>
              )}
              {canRefund && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4 text-sm text-indigo-700">
                  환불 조건에 해당합니다. 확인 시 환불 페이지로 이동합니다.
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={closeCancelModal}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={!cancelChecked}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-40"
                >
                  {canRefund ? '환불 페이지로 이동' : '수강 취소'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
