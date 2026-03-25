import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseDetail, type Course } from '../api/courses'
import { enroll, checkEnrollment, updateProgress } from '../api/enrollments'
import { getCourseRatings, addRating, type Rating } from '../api/ratings'
import { useAuth } from '../store/AuthContext'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { accessToken } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [error, setError] = useState('')

  // Ratings
  const [ratings, setRatings] = useState<Rating[]>([])
  const [myScore, setMyScore] = useState(5)
  const [myComment, setMyComment] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)

  // Progress update
  const [progressInput, setProgressInput] = useState(0)
  const [progressLoading, setProgressLoading] = useState(false)

  const id = Number(courseId)

  useEffect(() => {
    if (!courseId) return

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const [courseData, ratingData] = await Promise.all([
          getCourseDetail(id),
          getCourseRatings(id),
        ])
        setCourse(courseData)
        setRatings(ratingData)

        if (accessToken) {
          try {
            const status = await checkEnrollment(id)
            setEnrolled(status)
          } catch {
            setEnrolled(false)
          }
        }
      } catch {
        setError('강의 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, accessToken])

  useEffect(() => {
    setProgressInput(progress)
  }, [progress])

  async function handleEnroll() {
    if (!accessToken) {
      navigate('/auth', { state: { from: `/courses/${courseId}` } })
      return
    }
    setEnrollLoading(true)
    try {
      await enroll(id)
      setEnrolled(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '수강 신청에 실패했습니다.')
    } finally {
      setEnrollLoading(false)
    }
  }

  async function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setRatingLoading(true)
    try {
      const newRating = await addRating({ courseId: id, score: myScore, comment: myComment })
      setRatings((prev) => [newRating, ...prev])
      setAlreadyRated(true)
      // Refresh course to update averageRating
      const updated = await getCourseDetail(id)
      setCourse(updated)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg?.includes('이미')) setAlreadyRated(true)
      alert(msg ?? '평점 등록에 실패했습니다.')
    } finally {
      setRatingLoading(false)
    }
  }

  async function handleProgressUpdate(e: React.FormEvent) {
    e.preventDefault()
    setProgressLoading(true)
    try {
      await updateProgress(id, progressInput)
      setProgress(progressInput)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '진도 업데이트에 실패했습니다.')
    } finally {
      setProgressLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">강의 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error || '강의를 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← 뒤로가기
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          강의 목록
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Thumbnail */}
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-56 object-cover rounded-2xl" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
            <span className="text-white text-4xl font-bold">EditHub</span>
          </div>
        )}

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              {course.category}
            </span>
            <span className="text-xs text-gray-400">{course.status}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-sm text-gray-500">강사: {course.instructor.name}</p>
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            ★ <span className="font-medium text-gray-800">{course.averageRating.toFixed(1)}</span>
            <span className="text-gray-400 text-xs ml-1">({ratings.length}개 평점)</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
        </div>

        {/* Price & Enroll */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {course.price === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}
          </span>
          {enrolled ? (
            <button disabled className="px-6 py-3 bg-gray-200 text-gray-500 text-sm font-semibold rounded-xl cursor-not-allowed">
              수강 중
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {enrollLoading ? '처리 중...' : '수강 신청'}
            </button>
          )}
        </div>

        {/* Progress (수강 중일 때만) */}
        {enrolled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">학습 진도</h2>
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>현재 진도</span>
                <span className="font-medium text-gray-900">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <form onSubmit={handleProgressUpdate} className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progressInput}
                onChange={(e) => setProgressInput(Number(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700 w-10 text-right">{progressInput}%</span>
              <button
                type="submit"
                disabled={progressLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {progressLoading ? '저장 중' : '저장'}
              </button>
            </form>
          </div>
        )}

        {/* Rating Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-900">수강 후기</h2>

          {/* Add Rating (수강 중이고 아직 평점 없을 때) */}
          {enrolled && !alreadyRated && (
            <form onSubmit={handleRatingSubmit} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">평점 등록</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setMyScore(star)}
                    className={`text-2xl transition-colors ${star <= myScore ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder="강의 후기를 남겨주세요 (선택)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={ratingLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {ratingLoading ? '등록 중...' : '평점 등록'}
              </button>
            </form>
          )}

          {/* Ratings List */}
          {ratings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 후기가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                    <span className="text-sm font-medium text-gray-700">{r.authorName}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
