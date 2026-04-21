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

  async function handleCancel(courseId: number) {
    if (!confirm('수강을 취소하시겠습니까? 취소 후에는 강의에 접근할 수 없습니다.')) return
    setCancellingId(courseId)
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
                    ) : (
                      <span className="shrink-0 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">미시작</span>
                    )}
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

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                      {enrollment.progressPercent === 100 ? '다시 수강하기 →' : enrollment.progressPercent > 0 ? '이어 학습하기 →' : '학습 시작하기 →'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancel(enrollment.courseId) }}
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
    </div>
  )
}
