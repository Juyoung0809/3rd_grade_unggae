import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type CourseFormData,
} from '../api/instructor'
import type { Course } from '../api/courses'
import { useAuth } from '../store/AuthContext'

const CATEGORIES = ['YOUTUBE', 'SHORTS', 'MOTION', 'COLOR', 'THUMBNAIL']
const CATEGORY_LABEL: Record<string, string> = {
  YOUTUBE: 'YouTube',
  SHORTS: '쇼츠',
  MOTION: '모션',
  COLOR: '색보정',
  THUMBNAIL: '썸네일',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: '승인 대기', className: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED: { label: '게시 중', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: '거절됨', className: 'bg-red-100 text-red-700' },
  DELETED: { label: '삭제됨', className: 'bg-gray-100 text-gray-400' },
}

const EMPTY_FORM: CourseFormData = {
  title: '',
  description: '',
  category: 'YOUTUBE',
  price: 0,
  thumbnail: '',
  lectureCount: 1,
}

export default function InstructorCoursesPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setLoading(true)
    setError('')
    try {
      setCourses(await getInstructorCourses())
    } catch {
      setError('강의 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(course: Course) {
    setEditingId(course.id)
    setFormData({
      title: course.title,
      description: course.description ?? '',
      category: course.category,
      price: Number(course.price),
      thumbnail: course.thumbnailUrl ?? '',
      lectureCount: course.lectureCount,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      if (editingId === null) {
        await createCourse(formData)
      } else {
        await updateCourse(editingId, formData)
      }
      setModalOpen(false)
      await fetchCourses()
    } catch {
      setFormError(editingId === null ? '강의 등록에 실패했습니다.' : '강의 수정에 실패했습니다.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(courseId: number) {
    if (!confirm('강의를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) return
    try {
      await deleteCourse(courseId)
      await fetchCourses()
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/courses')}
          className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors"
        >
          EditHub
        </button>
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

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">내 강의 관리</h1>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            강의 등록
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm">불러오는 중...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">등록된 강의가 없습니다.</p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              첫 강의 등록하기
            </button>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div className="space-y-3">
            {courses.map((course) => {
              const badge = STATUS_BADGE[course.status] ?? STATUS_BADGE['PENDING']
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">EditHub</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {CATEGORY_LABEL[course.category] ?? course.category}
                      </span>
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900 truncate">{course.title}</h2>
                    <p className="text-xs text-gray-500">
                      {Number(course.price) === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}
                      {' · '}강의 {course.lectureCount}개
                      {' · '}★ {course.averageRating.toFixed(1)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 등록/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editingId === null ? '강의 등록' : '강의 수정'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700">제목 *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="강의 제목"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="강의 설명"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">카테고리 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">가격 (원) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">썸네일 URL</label>
                <input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData((f) => ({ ...f, thumbnail: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">강의 수 *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lectureCount}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, lectureCount: Number(e.target.value) }))
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? '처리 중...' : editingId === null ? '등록' : '수정'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
