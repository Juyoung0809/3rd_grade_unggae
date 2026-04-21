import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseDetail, type Course } from '../api/courses'
import { enroll, checkEnrollment, getEnrollmentDetail, completeLecture, getCompletedLectureIds } from '../api/enrollments'
import { getLectures, type Lecture } from '../api/lectures'
import { getCourseRatings, addRating, getMyRating, updateRating, deleteRating, type Rating } from '../api/ratings'
import {
  getCourseQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  type QuestionSummary,
  type QuestionResponse,
} from '../api/questions'
import { useAuth } from '../store/AuthContext'
import NavBar from '../components/NavBar'

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

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function isYoutube(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [completedLectureCount, setCompletedLectureCount] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null)
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<number>>(new Set())

  const [ratings, setRatings] = useState<Rating[]>([])
  const [myScore, setMyScore] = useState(5)
  const [myComment, setMyComment] = useState('')
  const [myRatingId, setMyRatingId] = useState<number | null>(null)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [editingRating, setEditingRating] = useState(false)

  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null)
  const [questionFormOpen, setQuestionFormOpen] = useState(false)
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionContent, setNewQuestionContent] = useState('')
  const [questionLoading, setQuestionLoading] = useState(false)
  const [answerInput, setAnswerInput] = useState('')
  const [answerLoading, setAnswerLoading] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
  const [editQuestionTitle, setEditQuestionTitle] = useState('')
  const [editQuestionContent, setEditQuestionContent] = useState('')
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null)
  const [editAnswerContent, setEditAnswerContent] = useState('')

  const id = Number(courseId)

  useEffect(() => {
    if (!courseId) return

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const [courseData, ratingData, questionData, lectureData] = await Promise.all([
          getCourseDetail(id),
          getCourseRatings(id),
          getCourseQuestions(id),
          getLectures(id),
        ])
        setCourse(courseData)
        setRatings(ratingData)
        setQuestions(questionData)
        setLectures(lectureData)

        if (accessToken) {
          try {
            const status = await checkEnrollment(id)
            setEnrolled(status)
            if (status) {
              const [enrollment, ids] = await Promise.all([
                getEnrollmentDetail(id),
                getCompletedLectureIds(id),
              ])
              setCompletedLectureCount(enrollment.completedLectureCount)
              setProgressPercent(enrollment.progressPercent)
              setCompletedLectureIds(new Set(ids))
            }
          } catch {
            setEnrolled(false)
          }

          try {
            const myRating = await getMyRating(id)
            if (myRating) {
              setAlreadyRated(true)
              setMyRatingId(myRating.id)
              setMyScore(myRating.score)
              setMyComment(myRating.comment ?? '')
            }
          } catch {
            // 무시
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
      setMyRatingId(newRating.id)
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

  async function handleRatingUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!myRatingId) return
    setRatingLoading(true)
    try {
      const updated = await updateRating(myRatingId, { score: myScore, comment: myComment })
      setRatings((prev) => prev.map((r) => (r.id === myRatingId ? updated : r)))
      setEditingRating(false)
      const updatedCourse = await getCourseDetail(id)
      setCourse(updatedCourse)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '평점 수정에 실패했습니다.')
    } finally {
      setRatingLoading(false)
    }
  }

  async function handleVideoEnded(lectureId: number) {
    if (completedLectureIds.has(lectureId)) return
    try {
      const updated = await completeLecture(id, lectureId)
      setCompletedLectureCount(updated.completedLectureCount)
      setProgressPercent(updated.progressPercent)
      setCompletedLectureIds(prev => new Set([...prev, lectureId]))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '강의 완료 처리에 실패했습니다.')
    }
  }

  async function handleQuestionClick(questionId: number) {
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null)
      return
    }
    try {
      const q = await getQuestion(questionId)
      setSelectedQuestion(q)
      setAnswerInput('')
      setEditingAnswerId(null)
    } catch {
      alert('질문을 불러오지 못했습니다.')
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault()
    setQuestionLoading(true)
    try {
      const q = await createQuestion({ courseId: id, title: newQuestionTitle, content: newQuestionContent })
      setQuestions((prev) => [{ id: q.id, courseId: q.courseId, title: q.title, authorId: q.authorId, authorName: q.authorName, createdAt: q.createdAt, updatedAt: q.updatedAt, answerCount: 0 }, ...prev])
      setNewQuestionTitle('')
      setNewQuestionContent('')
      setQuestionFormOpen(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '질문 등록에 실패했습니다.')
    } finally {
      setQuestionLoading(false)
    }
  }

  async function handleUpdateQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!editingQuestionId) return
    setQuestionLoading(true)
    try {
      const updated = await updateQuestion(editingQuestionId, { title: editQuestionTitle, content: editQuestionContent })
      setQuestions((prev) => prev.map((q) => q.id === editingQuestionId ? { ...q, title: updated.title, updatedAt: updated.updatedAt } : q))
      if (selectedQuestion?.id === editingQuestionId) {
        setSelectedQuestion({ ...selectedQuestion, title: updated.title, content: updated.content, updatedAt: updated.updatedAt })
      }
      setEditingQuestionId(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '질문 수정에 실패했습니다.')
    } finally {
      setQuestionLoading(false)
    }
  }

  async function handleCreateAnswer(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedQuestion) return
    setAnswerLoading(true)
    try {
      const newAnswer = await createAnswer(selectedQuestion.id, answerInput)
      setSelectedQuestion((prev) => prev ? { ...prev, answers: [...prev.answers, newAnswer] } : prev)
      setQuestions((prev) => prev.map((q) => q.id === selectedQuestion.id ? { ...q, answerCount: q.answerCount + 1 } : q))
      setAnswerInput('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '답변 등록에 실패했습니다.')
    } finally {
      setAnswerLoading(false)
    }
  }

  async function handleUpdateAnswer(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedQuestion || !editingAnswerId) return
    setAnswerLoading(true)
    try {
      const updated = await updateAnswer(selectedQuestion.id, editingAnswerId, editAnswerContent)
      setSelectedQuestion((prev) => prev ? { ...prev, answers: prev.answers.map((a) => a.id === editingAnswerId ? updated : a) } : prev)
      setEditingAnswerId(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '답변 수정에 실패했습니다.')
    } finally {
      setAnswerLoading(false)
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm('질문을 삭제하시겠습니까? 관련 답변도 모두 삭제됩니다.')) return
    try {
      await deleteQuestion(questionId)
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      if (selectedQuestion?.id === questionId) setSelectedQuestion(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '질문 삭제에 실패했습니다.')
    }
  }

  async function handleDeleteAnswer(questionId: number, answerId: number) {
    if (!confirm('답변을 삭제하시겠습니까?')) return
    try {
      await deleteAnswer(questionId, answerId)
      setSelectedQuestion((prev) =>
        prev ? { ...prev, answers: prev.answers.filter((a) => a.id !== answerId) } : prev
      )
      setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, answerCount: Math.max(0, q.answerCount - 1) } : q))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '답변 삭제에 실패했습니다.')
    }
  }

  async function handleDeleteRating(ratingId: number) {
    if (!confirm('후기를 삭제하시겠습니까?')) return
    try {
      await deleteRating(ratingId)
      setRatings((prev) => prev.filter((r) => r.id !== ratingId))
      setAlreadyRated(false)
      setMyRatingId(null)
      setMyScore(5)
      setMyComment('')
      const updated = await getCourseDetail(id)
      setCourse(updated)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '후기 삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">강의 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-700 font-semibold mb-2">{error || '강의를 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/courses')} className="text-sm text-indigo-600 hover:underline">
            강의 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* ── 강의 히어로 배너 ── */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col lg:flex-row gap-8 items-start">
          {/* 왼쪽: 정보 */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/40">
                {CATEGORY_LABEL[course.category] ?? course.category}
              </span>
              {course.status === 'PUBLISHED' && (
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                  게시 중
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-snug">{course.title}</h1>
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">{course.description}</p>
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">★</span>
                <span className="font-bold text-amber-400">{course.averageRating.toFixed(1)}</span>
                <span className="text-slate-400">({ratings.length}개 후기)</span>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">강의 {course.lectureCount}개</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">강사: <span className="text-white font-medium">{course.instructor.name}</span></span>
            </div>
          </div>

          {/* 오른쪽: 수강 신청 카드 */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-extrabold">Edit<span className="text-indigo-200">Hub</span></span>
                </div>
              )}
              <div className="p-5">
                {enrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">학습 진도</span>
                      <span className={`font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      {completedLectureCount} / {course.lectureCount} 강의 완료
                    </p>
                    <div className="px-4 py-3 bg-emerald-50 rounded-xl text-center">
                      <span className="text-emerald-700 text-sm font-semibold">✓ 수강 중인 강의입니다</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className={`text-3xl font-extrabold ${course.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {course.price === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}
                      </span>
                    </div>
                    <button
                      onClick={handleEnroll}
                      disabled={enrollLoading}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200"
                    >
                      {enrollLoading ? '처리 중...' : course.price === 0 ? '무료 수강 신청' : '수강 신청하기'}
                    </button>
                    <p className="text-xs text-slate-400 text-center">30일 환불 보장</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* 메인 컬럼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── 강의 목록 ── */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">강의 목록</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                  총 {lectures.length}강
                </span>
              </div>
              {lectures.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">등록된 강의가 없습니다.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {lectures.map((lecture, index) => {
                    const isCompleted = completedLectureIds.has(lecture.id)
                    const isLocked = !enrolled && index > 0
                    return (
                      <div
                        key={lecture.id}
                        onClick={() => !isLocked && setActiveLecture(lecture)}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                          isLocked
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-indigo-50 cursor-pointer group'
                        }`}
                      >
                        {/* 번호/완료 아이콘 */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-600'
                            : isLocked
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isLocked ? 'text-slate-400' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {lecture.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isYoutube(lecture.videoUrl) ? '▶ YouTube' : '▶ 동영상'}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {isCompleted ? (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">완료</span>
                          ) : enrolled ? (
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full group-hover:bg-indigo-100">수강하기 →</span>
                          ) : index === 0 ? (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">미리보기</span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">잠김</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ── 수강 후기 ── */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900">수강 후기</h2>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-sm font-bold text-slate-800">{course.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({ratings.length})</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* 후기 작성 폼 */}
                {enrolled && !alreadyRated && (
                  <form onSubmit={handleRatingSubmit} className="border border-indigo-100 rounded-xl p-4 space-y-3 bg-indigo-50/50">
                    <p className="text-sm font-bold text-slate-800">후기 작성하기</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMyScore(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${star <= myScore ? 'text-amber-400' : 'text-slate-200'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-slate-500 self-center">{myScore}점</span>
                    </div>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="강의에 대한 솔직한 후기를 남겨주세요 (선택)"
                      rows={3}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={ratingLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {ratingLoading ? '등록 중...' : '후기 등록'}
                    </button>
                  </form>
                )}

                {/* 후기 수정 폼 */}
                {alreadyRated && editingRating && (
                  <form onSubmit={handleRatingUpdate} className="border border-indigo-200 rounded-xl p-4 space-y-3 bg-indigo-50">
                    <p className="text-sm font-bold text-slate-800">후기 수정</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMyScore(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${star <= myScore ? 'text-amber-400' : 'text-slate-200'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={ratingLoading}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                        {ratingLoading ? '수정 중...' : '수정 완료'}
                      </button>
                      <button type="button" onClick={() => setEditingRating(false)}
                        className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                        취소
                      </button>
                    </div>
                  </form>
                )}

                {/* 후기 목록 */}
                {ratings.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                      아직 후기가 없어요. 첫 후기를 남겨보세요!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((r) => (
                      <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {r.authorName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">{r.authorName}</span>
                              <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                              {user && r.authorId === user.id && !editingRating && (
                                <>
                                  <button onClick={() => setEditingRating(true)} className="text-xs text-indigo-500 hover:text-indigo-700">
                                    수정
                                  </button>
                                  <button onClick={() => handleDeleteRating(r.id)} className="text-xs text-red-400 hover:text-red-600">
                                    삭제
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={`text-xs ${s <= r.score ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-slate-600 ml-10">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── 질문 게시판 ── */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  질문 게시판
                  {questions.length > 0 && (
                    <span className="ml-2 text-xs text-slate-500 font-normal">({questions.length})</span>
                  )}
                </h2>
                {enrolled && !questionFormOpen && (
                  <button
                    onClick={() => setQuestionFormOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    질문하기
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* 질문 작성 폼 */}
                {questionFormOpen && (
                  <form onSubmit={handleCreateQuestion} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                    <p className="text-sm font-bold text-slate-800">새 질문</p>
                    <input
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                      placeholder="질문 제목을 입력하세요"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <textarea
                      value={newQuestionContent}
                      onChange={(e) => setNewQuestionContent(e.target.value)}
                      placeholder="질문 내용을 자세히 입력하세요"
                      rows={4}
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={questionLoading}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                        {questionLoading ? '등록 중...' : '질문 등록'}
                      </button>
                      <button type="button" onClick={() => { setQuestionFormOpen(false); setNewQuestionTitle(''); setNewQuestionContent('') }}
                        className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                        취소
                      </button>
                    </div>
                  </form>
                )}

                {/* 질문 목록 */}
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                      아직 질문이 없어요. 궁금한 점을 질문해보세요!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {questions.map((q) => (
                      <div key={q.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div
                          className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => handleQuestionClick(q.id)}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-slate-400 text-xs mt-0.5 shrink-0">Q</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{q.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {q.authorName} · {new Date(q.createdAt).toLocaleDateString('ko-KR')}
                                {q.answerCount > 0 && <span className="ml-2 text-indigo-500 font-medium">답변 {q.answerCount}개</span>}
                              </p>
                            </div>
                          </div>
                          <span className="text-slate-400 text-xs ml-3 shrink-0">
                            {selectedQuestion?.id === q.id ? '▲' : '▼'}
                          </span>
                        </div>

                        {selectedQuestion?.id === q.id && (
                          <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
                            {/* 질문 본문 */}
                            {editingQuestionId === q.id ? (
                              <form onSubmit={handleUpdateQuestion} className="space-y-2">
                                <input value={editQuestionTitle} onChange={(e) => setEditQuestionTitle(e.target.value)} required
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                                <textarea value={editQuestionContent} onChange={(e) => setEditQuestionContent(e.target.value)} rows={4} required
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                                <div className="flex gap-2">
                                  <button type="submit" disabled={questionLoading}
                                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                                    {questionLoading ? '수정 중...' : '수정 완료'}
                                  </button>
                                  <button type="button" onClick={() => setEditingQuestionId(null)}
                                    className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-white">
                                    취소
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedQuestion.content}</p>
                                {user && selectedQuestion.authorId === user.id && (
                                  <div className="flex gap-2 shrink-0">
                                    <button onClick={() => { setEditingQuestionId(q.id); setEditQuestionTitle(selectedQuestion.title); setEditQuestionContent(selectedQuestion.content) }}
                                      className="text-xs text-indigo-500 hover:text-indigo-700">
                                      수정
                                    </button>
                                    <button onClick={() => handleDeleteQuestion(q.id)}
                                      className="text-xs text-red-400 hover:text-red-600">
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 답변 목록 */}
                            {selectedQuestion.answers.length > 0 && (
                              <div className="space-y-2 border-t border-slate-200 pt-3">
                                {selectedQuestion.answers.map((a) => (
                                  <div key={a.id} className={`rounded-xl p-3 ${a.instructorAnswer ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-slate-100'}`}>
                                    {editingAnswerId === a.id ? (
                                      <form onSubmit={handleUpdateAnswer} className="space-y-2">
                                        <textarea value={editAnswerContent} onChange={(e) => setEditAnswerContent(e.target.value)} rows={3} required
                                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <div className="flex gap-2">
                                          <button type="submit" disabled={answerLoading}
                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg">
                                            {answerLoading ? '수정 중...' : '수정 완료'}
                                          </button>
                                          <button type="button" onClick={() => setEditingAnswerId(null)}
                                            className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg">
                                            취소
                                          </button>
                                        </div>
                                      </form>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 mb-1.5">
                                          {a.instructorAnswer && (
                                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded">강사</span>
                                          )}
                                          <span className="text-xs font-semibold text-slate-700">{a.authorName}</span>
                                          <span className="text-xs text-slate-400 ml-auto">{new Date(a.createdAt).toLocaleDateString('ko-KR')}</span>
                                          {user && a.authorId === user.id && (
                                            <>
                                              <button onClick={() => { setEditingAnswerId(a.id); setEditAnswerContent(a.content) }}
                                                className="text-xs text-indigo-500 hover:text-indigo-700">
                                                수정
                                              </button>
                                              <button onClick={() => handleDeleteAnswer(selectedQuestion.id, a.id)}
                                                className="text-xs text-red-400 hover:text-red-600">
                                                삭제
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.content}</p>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 답변 작성 폼 */}
                            {accessToken && editingAnswerId === null && (
                              <form onSubmit={handleCreateAnswer} className="border-t border-slate-200 pt-3 space-y-2">
                                <textarea
                                  value={answerInput}
                                  onChange={(e) => setAnswerInput(e.target.value)}
                                  placeholder="답변을 입력하세요"
                                  rows={3}
                                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                                <button type="submit" disabled={answerLoading || !answerInput.trim()}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                                  {answerLoading ? '등록 중...' : '답변 등록'}
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 사이드바 (데스크톱) */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 sticky top-20">
              <h3 className="text-sm font-bold text-slate-900">강의 정보</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>{course.instructor.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>강의 {course.lectureCount}개</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>{course.averageRating.toFixed(1)}점 ({ratings.length}개 후기)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>{CATEGORY_LABEL[course.category] ?? course.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 강의 플레이어 모달 ── */}
      {activeLecture !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveLecture(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                {completedLectureIds.has(activeLecture.id) && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full">완료</span>
                )}
                <h3 className="text-sm font-semibold">{activeLecture.title}</h3>
              </div>
              <button onClick={() => setActiveLecture(null)}
                className="text-slate-400 hover:text-white text-xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            {/* 플레이어 */}
            {isYoutube(activeLecture.videoUrl) ? (
              <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  key={activeLecture.id}
                  src={`${getYoutubeEmbedUrl(activeLecture.videoUrl)}?enablejsapi=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                key={activeLecture.id}
                src={activeLecture.videoUrl}
                controls
                controlsList="nodownload"
                className="w-full bg-black"
                onEnded={() => enrolled && handleVideoEnded(activeLecture.id)}
              />
            )}

            {/* 모달 푸터 */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                {enrolled ? (
                  completedLectureIds.has(activeLecture.id) ? (
                    <span className="text-emerald-600 font-medium">✓ 완료한 강의입니다</span>
                  ) : isYoutube(activeLecture.videoUrl) ? (
                    '영상을 끝까지 시청한 후 완료 처리해주세요.'
                  ) : (
                    '영상을 끝까지 시청하면 자동으로 완료 처리됩니다.'
                  )
                ) : (
                  '수강 신청 후 진도율이 기록됩니다.'
                )}
              </p>
              {enrolled && isYoutube(activeLecture.videoUrl) && !completedLectureIds.has(activeLecture.id) && (
                <button onClick={() => handleVideoEnded(activeLecture.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
                  시청 완료
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
