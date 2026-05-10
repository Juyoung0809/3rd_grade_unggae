import { useEffect, useRef, useState } from 'react'
import {
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type CourseFormData,
} from '../api/instructor'
import {
  getCourseSections,
  createSection,
  updateSection,
  deleteSection,
  createLessonByUrl,
  createLessonByUpload,
  updateLessonByUrl,
  updateLessonByUpload,
  deleteLesson,
  type Section,
} from '../api/sections'
import type { Course } from '../api/courses'
import type { Lecture } from '../api/lectures'
import NavBar from '../components/NavBar'

const CATEGORIES = [
  'YOUTUBE', 'SHORTS', 'POST_PRODUCTION', 'ADVERTISEMENT', 'AI',
  'EVENT', 'INDUSTRY', 'MOTION', 'MUSIC', 'SOUND', 'COLOR', 'THUMBNAIL', 'VLOG',
]
const CATEGORY_LABEL: Record<string, string> = {
  YOUTUBE: '유튜브 영상', SHORTS: '쇼츠 영상', POST_PRODUCTION: '영상 후반작업',
  ADVERTISEMENT: '광고·홍보 영상', AI: 'AI 영상', EVENT: '행사 영상',
  INDUSTRY: '업종별 영상', MOTION: '모션그래픽', MUSIC: '음악·음원',
  SOUND: '기타 음향·음악', COLOR: '색보정', THUMBNAIL: '썸네일', VLOG: '브이로그',
}
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:   { label: '승인 대기', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  PUBLISHED: { label: '게시 중',   className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  REJECTED:  { label: '거절됨',    className: 'bg-red-100 text-red-700 border border-red-200' },
  DELETED:   { label: '삭제됨',    className: 'bg-slate-100 text-slate-400 border border-slate-200' },
}

const EMPTY_FORM: CourseFormData = { title: '', description: '', category: 'YOUTUBE', price: 0, thumbnail: '' }

type VideoInputType = 'URL' | 'UPLOAD'
interface LessonForm { title: string; inputType: VideoInputType; url: string; file: File | null }
const EMPTY_LESSON: LessonForm = { title: '', inputType: 'URL', url: '', file: null }

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 강의 모달
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // 섹션/레슨 관리 모달
  const [manageCourse, setManageCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  // 섹션 폼
  const [sectionFormOpen, setSectionFormOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionFormLoading, setSectionFormLoading] = useState(false)

  // 레슨 폼
  const [lessonFormSection, setLessonFormSection] = useState<number | null>(null)
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [lessonForm, setLessonForm] = useState<LessonForm>(EMPTY_LESSON)
  const [lessonFormLoading, setLessonFormLoading] = useState(false)
  const [lessonFormError, setLessonFormError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    setLoading(true); setError('')
    try { setCourses(await getInstructorCourses()) }
    catch { setError('강의 목록을 불러오지 못했습니다.') }
    finally { setLoading(false) }
  }

  async function fetchSections(courseId: number) {
    setSectionsLoading(true)
    try { setSections(await getCourseSections(courseId)) }
    catch { setSections([]) }
    finally { setSectionsLoading(false) }
  }

  function openCreateModal() {
    setEditingId(null); setFormData(EMPTY_FORM); setFormError(''); setCourseModalOpen(true)
  }
  function openEditModal(course: Course) {
    setEditingId(course.id)
    setFormData({ title: course.title, description: course.description ?? '', category: course.category, price: Number(course.price), thumbnail: course.thumbnailUrl ?? '' })
    setFormError(''); setCourseModalOpen(true)
  }

  async function handleCourseSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true); setFormError('')
    try {
      if (editingId === null) await createCourse(formData)
      else await updateCourse(editingId, formData)
      setCourseModalOpen(false); await fetchCourses()
    } catch { setFormError(editingId === null ? '강의 등록에 실패했습니다.' : '강의 수정에 실패했습니다.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(courseId: number) {
    if (!confirm('강의를 삭제하시겠습니까?')) return
    try { await deleteCourse(courseId); await fetchCourses() }
    catch { alert('삭제에 실패했습니다.') }
  }

  async function openManageModal(course: Course) {
    setManageCourse(course); setSectionFormOpen(false); setLessonFormSection(null)
    setExpandedSection(null); await fetchSections(course.id)
  }

  // 섹션 CRUD
  function openAddSectionForm() {
    setEditingSectionId(null); setSectionTitle(''); setSectionFormOpen(true)
  }
  function openEditSectionForm(section: Section) {
    setEditingSectionId(section.id); setSectionTitle(section.title); setSectionFormOpen(true)
  }

  async function handleSectionSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!manageCourse) return
    setSectionFormLoading(true)
    try {
      if (editingSectionId === null) await createSection(manageCourse.id, { title: sectionTitle })
      else await updateSection(editingSectionId, { title: sectionTitle })
      setSectionFormOpen(false); await fetchSections(manageCourse.id)
    } catch { alert('섹션 저장에 실패했습니다.') }
    finally { setSectionFormLoading(false) }
  }

  async function handleSectionDelete(sectionId: number) {
    if (!manageCourse || !confirm('섹션을 삭제하면 하위 레슨도 모두 삭제됩니다.')) return
    try { await deleteSection(sectionId); await fetchSections(manageCourse.id) }
    catch { alert('섹션 삭제에 실패했습니다.') }
  }

  // 레슨 CRUD
  function openAddLessonForm(sectionId: number) {
    setLessonFormSection(sectionId); setEditingLessonId(null); setLessonForm(EMPTY_LESSON); setLessonFormError('')
  }
  function openEditLessonForm(sectionId: number, lecture: Lecture) {
    setLessonFormSection(sectionId); setEditingLessonId(lecture.id)
    setLessonForm({ title: lecture.title, inputType: lecture.videoType, url: lecture.videoType === 'URL' ? lecture.videoUrl : '', file: null })
    setLessonFormError('')
  }

  async function handleLessonSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lessonFormSection || !manageCourse) return
    if (lessonForm.inputType === 'UPLOAD' && !lessonForm.file && editingLessonId === null) {
      setLessonFormError('파일을 선택해주세요.'); return
    }
    setLessonFormLoading(true); setLessonFormError('')
    try {
      if (editingLessonId === null) {
        if (lessonForm.inputType === 'URL') await createLessonByUrl(lessonFormSection, { title: lessonForm.title, videoType: 'URL', videoUrl: lessonForm.url })
        else await createLessonByUpload(lessonFormSection, lessonForm.title, lessonForm.file!)
      } else {
        if (lessonForm.inputType === 'URL') await updateLessonByUrl(lessonFormSection, editingLessonId, { title: lessonForm.title, videoType: 'URL', videoUrl: lessonForm.url })
        else if (lessonForm.file) await updateLessonByUpload(lessonFormSection, editingLessonId, lessonForm.title, lessonForm.file)
        else {
          const section = sections.find(s => s.id === lessonFormSection)
          const existing = section?.lectures.find(l => l.id === editingLessonId)
          await updateLessonByUrl(lessonFormSection, editingLessonId, { title: lessonForm.title, videoType: 'URL', videoUrl: existing?.videoUrl ?? '' })
        }
      }
      setLessonFormSection(null); setEditingLessonId(null)
      await fetchSections(manageCourse.id); await fetchCourses()
    } catch { setLessonFormError('저장에 실패했습니다.') }
    finally { setLessonFormLoading(false) }
  }

  async function handleLessonDelete(sectionId: number, lectureId: number) {
    if (!manageCourse || !confirm('레슨을 삭제하시겠습니까?')) return
    try { await deleteLesson(sectionId, lectureId); await fetchSections(manageCourse.id); await fetchCourses() }
    catch { alert('레슨 삭제에 실패했습니다.') }
  }

  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length
  const pendingCount = courses.filter(c => c.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">강사 대시보드</p>
              <h1 className="text-2xl font-extrabold text-slate-900">내 강의 관리</h1>
            </div>
            <button onClick={openCreateModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200 flex items-center gap-2">
              <span>+</span> 강의 등록
            </button>
          </div>
          {!loading && courses.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap mt-5">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl">
                <div><p className="text-xs text-slate-500">전체</p><p className="text-lg font-extrabold text-slate-800 leading-none">{courses.length}</p></div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl">
                <div><p className="text-xs text-emerald-600">게시 중</p><p className="text-lg font-extrabold text-emerald-700 leading-none">{publishedCount}</p></div>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 rounded-xl">
                  <div><p className="text-xs text-amber-600">승인 대기</p><p className="text-lg font-extrabold text-amber-700 leading-none">{pendingCount}</p></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 animate-pulse">
                <div className="w-20 h-14 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-700 font-semibold text-base mb-2">아직 등록한 강의가 없어요</p>
            <p className="text-slate-400 text-sm mb-6">첫 번째 강의를 만들어보세요!</p>
            <button onClick={openCreateModal}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200">
              첫 강의 등록하기
            </button>
          </div>
        )}
        {!loading && courses.length > 0 && (
          <div className="space-y-3">
            {courses.map(course => {
              const badge = STATUS_BADGE[course.status] ?? STATUS_BADGE['PENDING']
              return (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">EditHub</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                      <span className="text-xs text-slate-400 font-medium">{CATEGORY_LABEL[course.category] ?? course.category}</span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 truncate">{course.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{Number(course.price) === 0 ? '무료' : `${Number(course.price).toLocaleString()}원`}</span>
                      <span className="text-slate-300">·</span>
                      <span>챕터 {course.lectureCount}개</span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-0.5"><span className="text-amber-400">★</span>{course.averageRating.toFixed(1)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openManageModal(course)}
                      className="px-3 py-1.5 text-xs font-semibold border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                      섹션/레슨
                    </button>
                    <button onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                      수정
                    </button>
                    <button onClick={() => handleDelete(course.id)}
                      className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 강의 등록/수정 모달 */}
      {courseModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">{editingId === null ? '새 강의 등록' : '강의 수정'}</h2>
              <button onClick={() => setCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">강의 제목 *</label>
                <input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required
                  placeholder="강의 제목을 입력하세요"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">강의 설명</label>
                <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="수강생에게 보여질 강의 설명"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">카테고리 *</label>
                  <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">가격 (원) *</label>
                  <input type="number" min="0" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))}
                    placeholder="0 (무료)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">썸네일 URL</label>
                <input value={formData.thumbnail} onChange={e => setFormData(f => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all" />
              </div>
              {formError && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{formError}</div>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setCourseModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">취소</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                  {formLoading ? '처리 중...' : editingId === null ? '등록하기' : '수정하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 섹션/레슨 관리 모달 */}
      {manageCourse !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">섹션 & 레슨 관리</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-80">{manageCourse.title}</p>
              </div>
              <button onClick={() => { setManageCourse(null); setLessonFormSection(null); setSectionFormOpen(false) }}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {sectionsLoading ? (
                <p className="text-sm text-slate-400 text-center py-8">불러오는 중...</p>
              ) : sections.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-medium mb-1">아직 섹션이 없습니다</p>
                  <p className="text-xs">아래에서 섹션을 추가해보세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map(section => (
                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      {/* 섹션 헤더 */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors">
                          {expandedSection === section.id ? '▾' : '▸'}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{section.title}</p>
                          <p className="text-xs text-slate-400">{section.lectures.length}개 레슨</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => openEditSectionForm(section)}
                            className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-white transition-colors">수정</button>
                          <button onClick={() => handleSectionDelete(section.id)}
                            className="px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">삭제</button>
                        </div>
                      </div>

                      {/* 레슨 목록 (펼쳐졌을 때) */}
                      {expandedSection === section.id && (
                        <div className="px-4 py-3 space-y-2 border-t border-slate-100">
                          {section.lectures.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-2">레슨이 없습니다</p>
                          ) : (
                            section.lectures.map(lecture => (
                              <div key={lecture.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-indigo-600">
                                  {lecture.orderIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 truncate">{lecture.title}</p>
                                  <p className="text-xs text-slate-400">{lecture.videoType === 'URL' ? 'URL 링크' : '업로드'}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button onClick={() => openEditLessonForm(section.id, lecture)}
                                    className="px-2 py-0.5 text-xs font-medium border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors">수정</button>
                                  <button onClick={() => handleLessonDelete(section.id, lecture.id)}
                                    className="px-2 py-0.5 text-xs font-medium border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors">삭제</button>
                                </div>
                              </div>
                            ))
                          )}

                          {/* 레슨 추가/수정 폼 */}
                          {lessonFormSection === section.id ? (
                            <form onSubmit={handleLessonSubmit} className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3">
                              <p className="text-xs font-bold text-indigo-700">
                                {editingLessonId === null ? '+ 레슨 추가' : '레슨 수정'}
                              </p>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">레슨 제목 *</label>
                                <input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))}
                                  required placeholder="예: 1강 - 편집 기초"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">영상 유형</label>
                                <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white">
                                  {(['URL', 'UPLOAD'] as VideoInputType[]).map(t => (
                                    <button key={t} type="button"
                                      onClick={() => setLessonForm(f => ({ ...f, inputType: t, url: '', file: null }))}
                                      className={`flex-1 py-2 text-xs font-semibold transition-colors ${lessonForm.inputType === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                      {t === 'URL' ? 'URL 링크' : '파일 업로드'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {lessonForm.inputType === 'URL' ? (
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">영상 URL *</label>
                                  <input value={lessonForm.url} onChange={e => setLessonForm(f => ({ ...f, url: e.target.value }))}
                                    required placeholder="YouTube URL 또는 직접 영상 링크"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    영상 파일{editingLessonId !== null && ' (변경 시 새 파일 선택)'}
                                  </label>
                                  <div onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                                    {lessonForm.file
                                      ? <p className="text-xs text-indigo-600 font-semibold">{lessonForm.file.name}</p>
                                      : <p className="text-xs text-slate-500">클릭하여 영상 파일 선택</p>}
                                  </div>
                                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                                    onChange={e => { const file = e.target.files?.[0] ?? null; setLessonForm(f => ({ ...f, file })) }} />
                                </div>
                              )}
                              {lessonFormError && <p className="text-xs text-red-600">{lessonFormError}</p>}
                              <div className="flex gap-2">
                                <button type="button" onClick={() => { setLessonFormSection(null); setEditingLessonId(null) }}
                                  className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-white transition-colors">취소</button>
                                <button type="submit" disabled={lessonFormLoading}
                                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                  {lessonFormLoading ? '저장 중...' : editingLessonId === null ? '추가' : '저장'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button onClick={() => openAddLessonForm(section.id)}
                              className="w-full py-2 border border-dashed border-indigo-300 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-colors mt-2">
                              + 레슨 추가
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 섹션 추가/수정 폼 */}
            <div className="border-t border-slate-200 px-6 py-4 shrink-0 bg-slate-50">
              {sectionFormOpen ? (
                <form onSubmit={handleSectionSubmit} className="flex gap-2">
                  <input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} required
                    placeholder="섹션 제목 입력"
                    className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                  <button type="button" onClick={() => setSectionFormOpen(false)}
                    className="px-3.5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-white transition-colors">취소</button>
                  <button type="submit" disabled={sectionFormLoading}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                    {sectionFormLoading ? '...' : editingSectionId === null ? '추가' : '저장'}
                  </button>
                </form>
              ) : (
                <button onClick={openAddSectionForm}
                  className="w-full py-2.5 border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-colors">
                  + 섹션 추가
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
