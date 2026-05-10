import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, type Course } from '../api/courses'
import { getEnrolledCourseIds } from '../api/enrollments'
import { useAuth } from '../store/AuthContext'
import NavBar from '../components/NavBar'

const CATEGORIES = [
  '전체',
  'YOUTUBE',
  'SHORTS',
  'POST_PRODUCTION',
  'ADVERTISEMENT',
  'AI',
  'EVENT',
  'INDUSTRY',
  'MOTION',
  'MUSIC',
  'SOUND',
  'COLOR',
  'THUMBNAIL',
  'VLOG',
]
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

export default function CourseListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState<'LATEST' | 'RATING' | 'STUDENTS'>('LATEST')
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      setError('')
      try {
        const data = await getCourses({
          category: selectedCategory === '전체' ? undefined : selectedCategory,
          keyword: keyword || undefined,
          sort,
        })
        setCourses(data)
      } catch {
        setError('강의 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [selectedCategory, keyword, sort])

  useEffect(() => {
    if (!user) return
    getEnrolledCourseIds()
      .then((ids) => setEnrolledIds(new Set(ids)))
      .catch(() => {})
  }, [user])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setKeyword(searchInput.trim())
  }

  const searchBar = (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="강의 검색..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
        검색
      </button>
      {keyword && (
        <button type="button" onClick={() => { setKeyword(''); setSearchInput('') }}
          className="px-3 py-2 border border-slate-200 text-slate-500 text-sm rounded-lg hover:bg-slate-100 transition-colors">
          ✕
        </button>
      )}
    </form>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar centerSlot={searchBar} />

      {/* ── 히어로 섹션 ── */}
      <section className="bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">
              영상 편집 전문 플랫폼
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              원하는 것은 무엇이든<br />
              <span className="text-yellow-300">배울 수 있어요</span>
            </h1>
            <p className="text-indigo-200 text-base mb-8 leading-relaxed">
              유튜브 편집부터 쇼츠, 모션그래픽, 색보정, 썸네일 디자인까지<br className="hidden md:block" />
              현직 전문가가 직접 가르치는 실무 강의를 만나보세요.
            </p>

            {/* 모바일 검색바 */}
            <form onSubmit={handleSearch} className="flex gap-2 sm:hidden mb-6">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="강의 검색..."
                className="flex-1 px-4 py-3 rounded-xl text-slate-800 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-sm font-bold rounded-xl transition-colors"
              >
                검색
              </button>
            </form>

          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {cat === '전체' ? '전체' : CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        {/* 검색 결과 안내 */}
        {keyword && (
          <div className="flex items-center justify-between mb-5 py-3 px-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium">
              "<span className="font-bold">{keyword}</span>" 검색 결과 {!loading && `— ${courses.length}개`}
            </p>
            <button
              onClick={() => { setKeyword(''); setSearchInput('') }}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
            >
              검색 초기화 ✕
            </button>
          </div>
        )}

        {/* 상태 */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-700 font-semibold text-base mb-2">
              {keyword ? `"${keyword}"에 대한 강의를 찾지 못했어요` : '등록된 강의가 없습니다'}
            </p>
            <p className="text-slate-400 text-sm mb-6">다른 키워드로 검색해 보세요</p>
            {keyword && (
              <button
                onClick={() => { setKeyword(''); setSearchInput('') }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                전체 강의 보기
              </button>
            )}
          </div>
        )}

        {/* 강의 그리드 */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              {!keyword && (
                <p className="text-sm text-slate-500">
                  총 <span className="font-semibold text-slate-800">{courses.length}개</span>의 강의
                </p>
              )}
              <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 ml-auto">
                {([['LATEST', '최신순'], ['RATING', '평점순'], ['STUDENTS', '수강생순']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSort(val)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sort === val ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => {
                const isEnrolled = enrolledIds.has(course.id)
                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="course-card bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group"
                  >
                    {/* 썸네일 */}
                    <div className="relative overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-44 bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <span className="text-white text-xl font-extrabold tracking-tight">
                            Edit<span className="text-indigo-200">Hub</span>
                          </span>
                        </div>
                      )}
                      {/* 배지들 */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          {CATEGORY_LABEL[course.category] ?? course.category}
                        </span>
                      </div>
                      {isEnrolled && (
                        <span className="absolute top-2 right-2 text-xs font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-full shadow">
                          수강 중
                        </span>
                      )}
                      {course.price === 0 && (
                        <span className="absolute bottom-2 left-2 text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">
                          무료
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      {/* 제목 */}
                      <h2 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h2>

                      {/* 강사 */}
                      <p className="text-xs text-slate-500 mb-3">{course.instructor.name}</p>

                      {/* 하단 */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-sm">★</span>
                          <span className="text-xs font-bold text-slate-700">{course.averageRating.toFixed(1)}</span>
                        </div>
                        <span className={`text-sm font-extrabold ${course.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {course.price === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      {/* ── 푸터 ── */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="font-extrabold text-lg text-indigo-600">Edit<span className="text-slate-800">Hub</span></span>
            <p className="text-xs text-slate-400 mt-1">영상 편집 전문 온라인 강의 플랫폼</p>
          </div>
          <p className="text-xs text-slate-400">© 2025 EditHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
