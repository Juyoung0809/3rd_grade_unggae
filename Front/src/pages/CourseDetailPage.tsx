import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseDetail, type Course } from '../api/courses'
import { enroll, checkEnrollment, getEnrollmentDetail, completeLecture } from '../api/enrollments'
import { getCourseRatings, addRating, getMyRating, updateRating, type Rating } from '../api/ratings'
import {
  getCourseQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  createAnswer,
  updateAnswer,
  type QuestionSummary,
  type QuestionResponse,
} from '../api/questions'
import { useAuth } from '../store/AuthContext'

const LECTURES = [
  { title: '강의 1: 프리미어 프로 편집 기초', image: '/image/엄.png' },
  { title: '강의 2: 색보정 기초 (DaVinci Resolve)', image: '/image/엄2.png' },
]

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [completedLectureCount, setCompletedLectureCount] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [lectureLoading, setLectureLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeLectureIndex, setActiveLectureIndex] = useState<number | null>(null)
  const [completedLectureIndices, setCompletedLectureIndices] = useState<Set<number>>(new Set())

  // Ratings
  const [ratings, setRatings] = useState<Rating[]>([])
  const [myScore, setMyScore] = useState(5)
  const [myComment, setMyComment] = useState('')
  const [myRatingId, setMyRatingId] = useState<number | null>(null)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [editingRating, setEditingRating] = useState(false)

  // Questions
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
        const [courseData, ratingData, questionData] = await Promise.all([
          getCourseDetail(id),
          getCourseRatings(id),
          getCourseQuestions(id),
        ])
        setCourse(courseData)
        setRatings(ratingData)
        setQuestions(questionData)

        if (accessToken) {
          try {
            const status = await checkEnrollment(id)
            setEnrolled(status)
            if (status) {
              const enrollment = await getEnrollmentDetail(id)
              setCompletedLectureCount(enrollment.completedLectureCount)
              setProgressPercent(enrollment.progressPercent)
            }
          } catch {
            setEnrolled(false)
          }

          const myRating = await getMyRating(id)
          if (myRating) {
            setAlreadyRated(true)
            setMyRatingId(myRating.id)
            setMyScore(myRating.score)
            setMyComment(myRating.comment ?? '')
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

  async function handleCompleteLecture(index: number) {
    if (completedLectureIndices.has(index)) return
    setLectureLoading(true)
    try {
      const updated = await completeLecture(id)
      setCompletedLectureCount(updated.completedLectureCount)
      setProgressPercent(updated.progressPercent)
      setCompletedLectureIndices(prev => new Set([...prev, index]))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? '강의 완료 처리에 실패했습니다.')
    } finally {
      setLectureLoading(false)
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
        {!enrolled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {course.price === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}
            </span>
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {enrollLoading ? '처리 중...' : '수강 신청'}
            </button>
          </div>
        )}

        {/* Progress (수강 중일 때만) */}
        {enrolled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">학습 진도</h2>
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>
                  {completedLectureCount} / {course.lectureCount} 강의 완료
                </span>
                <span className="font-medium text-gray-900">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lecture List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">강의 목록</h2>
          <div className="space-y-3">
            {LECTURES.map((lecture, index) => (
              <div
                key={index}
                onClick={() => setActiveLectureIndex(index)}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <img
                  src={lecture.image}
                  alt={lecture.title}
                  className="w-24 h-14 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{lecture.title}</p>
                </div>
                {enrolled && completedLectureIndices.has(index) ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">완료</span>
                ) : (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
                    {enrolled ? '수강하기' : '미리보기'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-900">수강 후기</h2>

          {/* 후기 작성 폼 (수강 중이고 아직 평점 없을 때) */}
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

          {/* 후기 수정 폼 (본인 후기 수정 시) */}
          {alreadyRated && editingRating && (
            <form onSubmit={handleRatingUpdate} className="border border-blue-100 rounded-xl p-4 space-y-3 bg-blue-50">
              <p className="text-sm font-medium text-gray-700">평점 수정</p>
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
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {ratingLoading ? '수정 중...' : '수정 완료'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRating(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
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
                    {user && r.authorId === user.id && !editingRating && (
                      <button
                        onClick={() => setEditingRating(true)}
                        className="text-xs text-blue-500 hover:text-blue-700 ml-1"
                      >
                        수정
                      </button>
                    )}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Board */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">질문 게시판</h2>
            {enrolled && !questionFormOpen && (
              <button
                onClick={() => setQuestionFormOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                질문하기
              </button>
            )}
          </div>

          {/* 질문 작성 폼 */}
          {questionFormOpen && (
            <form onSubmit={handleCreateQuestion} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <input
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
                placeholder="질문 제목"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newQuestionContent}
                onChange={(e) => setNewQuestionContent(e.target.value)}
                placeholder="질문 내용을 입력하세요"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={questionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {questionLoading ? '등록 중...' : '질문 등록'}
                </button>
                <button
                  type="button"
                  onClick={() => { setQuestionFormOpen(false); setNewQuestionTitle(''); setNewQuestionContent('') }}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* 질문 목록 */}
          {questions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 질문이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* 질문 카드 헤더 */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleQuestionClick(q.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{q.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {q.authorName} · {new Date(q.createdAt).toLocaleDateString('ko-KR')} · 답변 {q.answerCount}개
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs ml-3">
                      {selectedQuestion?.id === q.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* 질문 상세 (클릭 시 펼침) */}
                  {selectedQuestion?.id === q.id && (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
                      {/* 질문 본문 */}
                      {editingQuestionId === q.id ? (
                        <form onSubmit={handleUpdateQuestion} className="space-y-3">
                          <input
                            value={editQuestionTitle}
                            onChange={(e) => setEditQuestionTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            value={editQuestionContent}
                            onChange={(e) => setEditQuestionContent(e.target.value)}
                            rows={4}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={questionLoading}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                            >
                              {questionLoading ? '수정 중...' : '수정 완료'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg"
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedQuestion.content}</p>
                            {user && selectedQuestion.authorId === user.id && (
                              <button
                                onClick={() => {
                                  setEditingQuestionId(q.id)
                                  setEditQuestionTitle(selectedQuestion.title)
                                  setEditQuestionContent(selectedQuestion.content)
                                }}
                                className="text-xs text-blue-500 hover:text-blue-700 shrink-0"
                              >
                                수정
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 답변 목록 */}
                      {selectedQuestion.answers.length > 0 && (
                        <div className="space-y-3 border-t border-gray-200 pt-3">
                          {selectedQuestion.answers.map((a) => (
                            <div key={a.id} className="bg-white rounded-lg p-3 space-y-1">
                              {editingAnswerId === a.id ? (
                                <form onSubmit={handleUpdateAnswer} className="space-y-2">
                                  <textarea
                                    value={editAnswerContent}
                                    onChange={(e) => setEditAnswerContent(e.target.value)}
                                    rows={3}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      disabled={answerLoading}
                                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                                    >
                                      {answerLoading ? '수정 중...' : '수정 완료'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingAnswerId(null)}
                                      className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-700">{a.authorName}</span>
                                    {a.instructorAnswer && (
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">강사</span>
                                    )}
                                    <span className="text-xs text-gray-400 ml-auto">
                                      {new Date(a.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                    {user && a.authorId === user.id && (
                                      <button
                                        onClick={() => {
                                          setEditingAnswerId(a.id)
                                          setEditAnswerContent(a.content)
                                        }}
                                        className="text-xs text-blue-500 hover:text-blue-700"
                                      >
                                        수정
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 답변 작성 폼 (로그인 시) */}
                      {accessToken && editingAnswerId === null && (
                        <form onSubmit={handleCreateAnswer} className="border-t border-gray-200 pt-3 space-y-2">
                          <textarea
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder="답변을 입력하세요"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={answerLoading || !answerInput.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
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
      </main>

      {/* Lecture Viewer Modal */}
      {activeLectureIndex !== null && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveLectureIndex(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {LECTURES[activeLectureIndex].title}
              </h3>
              <button
                onClick={() => setActiveLectureIndex(null)}
                className="text-gray-400 hover:text-gray-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <img
              src={LECTURES[activeLectureIndex].image}
              alt={LECTURES[activeLectureIndex].title}
              className="w-full"
            />
            <div className="px-5 py-4 flex justify-end">
              {enrolled && (
                completedLectureIndices.has(activeLectureIndex) ? (
                  <span className="text-sm text-gray-500 font-medium">완료된 강의입니다</span>
                ) : (
                  <button
                    onClick={() => handleCompleteLecture(activeLectureIndex)}
                    disabled={lectureLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {lectureLoading ? '처리 중...' : '강의 완료'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
