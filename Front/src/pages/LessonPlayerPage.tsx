import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getCourseDetail, type Course } from '../api/courses'
import { getEnrollmentDetail, completeLecture, getCompletedLectureIds } from '../api/enrollments'
import { getLectures, type Lecture } from '../api/lectures'
import { useAuth } from '../store/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function isYoutube(url: string) {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYoutubeVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function getYoutubeEmbedUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url)
  if (!videoId) return null
  const origin = encodeURIComponent(window.location.origin)
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${origin}&rel=0&modestbranding=1`
}

function getVideoSrc(lecture: Lecture): string {
  if (lecture.videoType === 'UPLOAD') {
    return lecture.videoUrl.startsWith('http')
      ? lecture.videoUrl
      : `${API_BASE}${lecture.videoUrl}`
  }
  return lecture.videoUrl
}

export default function LessonPlayerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const id = Number(courseId)

  const [course, setCourse] = useState<Course | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [progressPercent, setProgressPercent] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showNextModal, setShowNextModal] = useState(false)
  const [completeError, setCompleteError] = useState('')

  const completingRef = useRef(false)
  const completedIdsRef = useRef(completedIds)
  const nextLectureRef = useRef<Lecture | null>(null)

  useEffect(() => { completedIdsRef.current = completedIds }, [completedIds])

  // ── 데이터 로드 ──
  useEffect(() => {
    if (!courseId || !accessToken) { navigate(`/courses/${courseId}`); return }
    async function load() {
      setLoading(true)
      try {
        const [courseData, lectureData] = await Promise.all([
          getCourseDetail(id), getLectures(id),
        ])
        setCourse(courseData)
        setLectures(lectureData)

        const [enrollment, ids] = await Promise.all([
          getEnrollmentDetail(id), getCompletedLectureIds(id),
        ])
        setProgressPercent(enrollment.progressPercent)
        setCompletedCount(enrollment.completedLectureCount)
        setCompletedIds(new Set(ids))

        const paramId = Number(searchParams.get('lecture'))
        const target = lectureData.find(l => l.id === paramId) ?? lectureData[0]
        if (target) setActiveLecture(target)
      } catch {
        navigate(`/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, accessToken])

  // ── 강의 완료 처리 (ref 패턴으로 stale closure 방지) ──
  const handleVideoEndedRef = useRef(async (_lectureId: number) => {})
  handleVideoEndedRef.current = async (lectureId: number) => {
    if (completingRef.current || completedIdsRef.current.has(lectureId)) return
    completingRef.current = true
    setCompleteError('')
    try {
      const updated = await completeLecture(id, lectureId)
      setCompletedCount(updated.completedLectureCount)
      setProgressPercent(updated.progressPercent)
      setCompletedIds(prev => new Set([...prev, lectureId]))
      if (nextLectureRef.current) setShowNextModal(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setCompleteError(msg || '진도 업데이트 중 오류가 발생했습니다.')
    } finally {
      completingRef.current = false
    }
  }

  // ── YouTube postMessage 이벤트 수신 (video ended 감지) ──
  useEffect(() => {
    if (!activeLecture || !isYoutube(activeLecture.videoUrl)) return
    const capturedId = activeLecture.id

    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data = JSON.parse(typeof event.data === 'string' ? event.data : '')
        const isEnded =
          // IFrame API 이벤트 형식
          (data.event === 'onStateChange' && data.info === 0) ||
          // infoDelivery 형식
          (data.event === 'infoDelivery' && data.info?.playerState === 0)
        if (isEnded) handleVideoEndedRef.current(capturedId)
      } catch {}
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [activeLecture?.id])

  // ── 강의 전환 ──
  const switchLecture = useCallback((lecture: Lecture) => {
    setActiveLecture(lecture)
    setSearchParams({ lecture: String(lecture.id) })
    setShowNextModal(false)
    setCompleteError('')
    completingRef.current = false
  }, [setSearchParams])

  const currentIndex = lectures.findIndex(l => l.id === activeLecture?.id)
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null
  nextLectureRef.current = nextLecture

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
  if (!course || !activeLecture) return null

  const isYT = isYoutube(activeLecture.videoUrl)
  const isDone = completedIds.has(activeLecture.id)
  const embedUrl = isYT ? getYoutubeEmbedUrl(activeLecture.videoUrl) : null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── 헤더 ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium shrink-0"
          >
            ← 강의 소개
          </button>
          <span className="text-slate-300 hidden sm:block">|</span>
          <span className="text-slate-800 text-sm font-semibold truncate hidden sm:block">{course.title}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isDone && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ✓ 완료
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-slate-500 text-xs font-medium whitespace-nowrap">
              {completedCount}/{lectures.length}강
            </span>
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* 메인 영역 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* 비디오 플레이어 */}
          <div className="bg-black w-full relative" style={{ aspectRatio: '16/9' }}>
            {isYT && embedUrl ? (
              <iframe
                key={activeLecture.id}
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isYT && !embedUrl ? (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                유효하지 않은 YouTube URL입니다.
              </div>
            ) : (
              <video
                key={activeLecture.id}
                src={getVideoSrc(activeLecture)}
                controls
                controlsList="nodownload"
                className="absolute inset-0 w-full h-full"
                onEnded={() => handleVideoEndedRef.current(activeLecture.id)}
              />
            )}
          </div>

          {/* 강의 제목 + 이전/다음 */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 font-medium mb-0.5">{currentIndex + 1} / {lectures.length}강</p>
              <h2 className="text-slate-900 font-bold text-base truncate">{activeLecture.title}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => prevLecture && switchLecture(prevLecture)}
                disabled={!prevLecture}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
              >
                ← 이전
              </button>
              <button
                onClick={() => nextLecture && switchLecture(nextLecture)}
                disabled={!nextLecture}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                다음 →
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {completeError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
              <span>{completeError}</span>
              <button onClick={() => setCompleteError('')} className="text-red-400 hover:text-red-600 ml-2 font-bold">✕</button>
            </div>
          )}

          {/* 강의 설명 */}
          <div className="p-6 bg-white flex-1">
            <div className="max-w-3xl">
              {activeLecture.description ? (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{activeLecture.description}</p>
              ) : (
                <p className="text-slate-400 text-sm">강의 설명이 없습니다.</p>
              )}
              <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-400 space-y-1">
                <p>강사: <span className="text-slate-600 font-medium">{course.instructor.name}</span></p>
                <p>
                  진도:{' '}
                  <span className={`font-semibold ${progressPercent === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    {progressPercent}%
                  </span>{' '}
                  ({completedCount}/{lectures.length}강 완료)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 커리큘럼 사이드바 ── */}
        <aside className="w-72 shrink-0 bg-white border-l border-slate-200 hidden lg:flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-slate-900 text-sm font-bold">강의 목록</p>
            <p className="text-slate-400 text-xs mt-0.5">{completedCount}/{lectures.length}강 완료 · {progressPercent}%</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {lectures.map((lecture, idx) => {
              const isActive = lecture.id === activeLecture.id
              const done = completedIds.has(lecture.id)
              return (
                <button
                  key={lecture.id}
                  onClick={() => switchLecture(lecture)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-l-2 ${
                    isActive ? 'bg-indigo-50 border-l-indigo-600' : 'hover:bg-slate-50 border-l-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    done ? 'bg-emerald-100 text-emerald-600' :
                    isActive ? 'bg-indigo-100 text-indigo-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate leading-snug ${
                      isActive ? 'text-indigo-700' : done ? 'text-slate-400' : 'text-slate-700'
                    }`}>{lecture.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{isYoutube(lecture.videoUrl) ? 'YouTube' : '동영상'}</p>
                  </div>
                  {isActive && <span className="text-indigo-500 text-xs shrink-0 font-bold">▶</span>}
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {/* ── 다음 강의 팝업 ── */}
      {showNextModal && nextLecture && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 text-xl">✓</span>
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-1">강의를 완료했습니다!</h3>
              <p className="text-slate-500 text-sm">다음 강의로 넘어가시겠습니까?</p>
            </div>

            <div className="px-6 pt-3 pb-2">
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-xs text-slate-400 font-medium mb-0.5">다음 강의</p>
                <p className="text-slate-800 text-sm font-semibold truncate">{nextLecture.title}</p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 flex gap-3">
              <button
                onClick={() => setShowNextModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
              >
                아니요
              </button>
              <button
                onClick={() => switchLecture(nextLecture)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                다음 강의
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
