import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, type Course } from '../api/courses'
import { getEnrolledCourseIds } from '../api/enrollments'
import { useAuth } from '../store/AuthContext'
import NavBar from '../components/NavBar'
import { ArrowRightIcon } from '../components/ArrowIcons'

const CATEGORIES = [
  'YOUTUBE', 'SHORTS', 'POST_PRODUCTION', 'ADVERTISEMENT', 'AI', 'EVENT',
  'INDUSTRY', 'MOTION', 'MUSIC', 'SOUND', 'COLOR', 'THUMBNAIL', 'VLOG',
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
const CATEGORY_ICON: Record<string, string> = {
  YOUTUBE: '▶', SHORTS: '⚡', POST_PRODUCTION: '🎬', ADVERTISEMENT: '📢', AI: '🤖',
  EVENT: '🎉', INDUSTRY: '🏢', MOTION: '✨', MUSIC: '🎵', SOUND: '🔊',
  COLOR: '🎨', THUMBNAIL: '🖼️', VLOG: '📹',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [popularCourses, setPopularCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    getCourses({ sort: 'STUDENTS', page: 0, size: 6 })
      .then((data) => setPopularCourses(data.content))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    getEnrolledCourseIds()
      .then((ids) => setEnrolledIds(new Set(ids)))
      .catch(() => {})
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* ── 히어로 섹션 ── */}
      <section className="bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28 text-center">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">
            영상 편집 전문 온라인 강의 플랫폼
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            영상으로 말하는 방법,<br />
            <span className="text-yellow-300">EditHub</span>에서 배우세요
          </h1>
          <p className="text-indigo-200 text-base md:text-lg mb-10 leading-relaxed">
            유튜브 편집부터 쇼츠, 모션그래픽, 색보정, 썸네일 디자인까지<br className="hidden md:block" />
            현직 전문가가 직접 가르치는 실무 강의를 만나보세요.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/courses')}
              className="px-7 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-sm font-bold rounded-xl transition-colors shadow-lg shadow-black/10"
            >
              강의 둘러보기
            </button>
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-bold rounded-xl transition-colors backdrop-blur-sm"
              >
                무료로 시작하기
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 카테고리별로 둘러보기 ── */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="text-xl font-bold text-slate-900 mb-6">카테고리별로 둘러보기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/courses?category=${cat}`)}
              className="flex items-center gap-2.5 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-lg">{CATEGORY_ICON[cat]}</span>
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>
      </section>

      {/* ── 인기 강의 ── */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">인기 강의</h2>
          <button onClick={() => navigate('/courses')} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            전체 강의 보기 <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : popularCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            아직 등록된 강의가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularCourses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id)
              return (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="course-card bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group"
              >
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
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">{course.instructor.name}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-xs font-bold text-slate-700">{course.averageRating.toFixed(1)}</span>
                      </span>
                      <span className="text-xs text-slate-400">수강생 {course.enrollmentCount}명</span>
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
        )}
      </section>

      {/* ── CTA 배너 ── */}
      <section className="bg-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-5 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">지금 EditHub와 함께 시작하세요</h2>
          <p className="text-indigo-200 text-sm md:text-base mb-8">
            영상 편집 실력을 한 단계 끌어올릴 강의가 기다리고 있어요.
          </p>
          <button
            onClick={() => navigate(user ? '/courses' : '/auth')}
            className="px-7 py-3.5 bg-white hover:bg-slate-100 text-indigo-600 text-sm font-bold rounded-xl transition-colors shadow-lg shadow-black/10"
          >
            {user ? '강의 둘러보기' : '무료로 시작하기'}
          </button>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-slate-200 bg-white">
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
