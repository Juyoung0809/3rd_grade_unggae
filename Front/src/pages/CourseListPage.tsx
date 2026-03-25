import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, type Course } from '../api/courses'
import { useAuth } from '../store/AuthContext'

const CATEGORIES = ['전체', 'YOUTUBE', 'SHORTS', 'MOTION', 'COLOR', 'THUMBNAIL']
const CATEGORY_LABEL: Record<string, string> = {
  YOUTUBE: 'YouTube',
  SHORTS: '쇼츠',
  MOTION: '모션',
  COLOR: '색보정',
  THUMBNAIL: '썸네일',
}

export default function CourseListPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      setError('')
      try {
        const data = await getCourses({
          category: selectedCategory === '전체' ? undefined : selectedCategory,
          keyword: keyword || undefined,
        })
        setCourses(data)
      } catch {
        setError('강의 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [selectedCategory, keyword])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setKeyword(searchInput.trim())
  }

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/courses')}
          className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors"
        >
          EditHub
        </button>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => navigate('/my/enrollments')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                내 강의
              </button>
              <span className="text-sm text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">강의 목록</h1>
          <p className="text-sm text-gray-500">영상편집 전문 강의를 만나보세요.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="강의 제목 또는 내용 검색"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            검색
          </button>
          {keyword && (
            <button
              type="button"
              onClick={() => { setKeyword(''); setSearchInput('') }}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              초기화
            </button>
          )}
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat === '전체' ? '전체' : CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-20 text-gray-400 text-sm">불러오는 중...</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        )}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">
            {keyword ? `"${keyword}"에 대한 검색 결과가 없습니다.` : '등록된 강의가 없습니다.'}
          </div>
        )}

        {/* Course Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">EditHub</span>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  {/* Category Badge */}
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {CATEGORY_LABEL[course.category] ?? course.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {course.title}
                  </h2>

                  {/* Instructor */}
                  <p className="text-xs text-gray-500">{course.instructor.name}</p>

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      ★ <span className="font-medium text-gray-700">{course.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {course.price === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}
                    </span>
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
