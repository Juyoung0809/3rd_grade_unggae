import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyEnrollments, type Enrollment } from '../api/enrollments'
import { useAuth } from '../store/AuthContext'

export default function MyEnrollmentsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900 text-lg">EditHub</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-6">신청한 강의</h1>

        {loading && (
          <p className="text-gray-500 text-sm">불러오는 중...</p>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {!loading && !error && enrollments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">신청한 강의가 없습니다.</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
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
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                {enrollment.thumbnailUrl ? (
                  <img
                    src={enrollment.thumbnailUrl}
                    alt={enrollment.courseTitle}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">EditHub</span>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {enrollment.courseTitle}
                  </h2>
                  <p className="text-xs text-gray-500">{enrollment.instructorName}</p>

                  {/* Progress bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>진도율</span>
                      <span>{enrollment.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
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
