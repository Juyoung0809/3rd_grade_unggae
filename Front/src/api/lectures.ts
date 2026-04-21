import api from './axios'

export interface Lecture {
  id: number
  title: string
  orderIndex: number
  videoType: 'URL' | 'UPLOAD'
  videoUrl: string
}

// 공개 - 강의 챕터 목록
export const getLectures = (courseId: number): Promise<Lecture[]> =>
  api.get(`/api/courses/${courseId}/lectures`)

// 강사 - URL로 챕터 추가
export const createLectureByUrl = (
  courseId: number,
  data: { title: string; videoType: 'URL'; videoUrl: string }
): Promise<Lecture> =>
  api.post(`/api/instructor/courses/${courseId}/lectures/url`, data)

// 강사 - 파일 업로드로 챕터 추가
export const createLectureByUpload = (courseId: number, title: string, file: File): Promise<Lecture> => {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)
  return api.post(`/api/instructor/courses/${courseId}/lectures/upload`, form, {
    headers: { 'Content-Type': undefined }, // boundary 포함한 Content-Type을 브라우저가 자동 설정
  })
}

// 강사 - URL로 챕터 수정
export const updateLectureByUrl = (
  courseId: number,
  lectureId: number,
  data: { title: string; videoType: 'URL'; videoUrl: string }
): Promise<Lecture> =>
  api.put(`/api/instructor/courses/${courseId}/lectures/${lectureId}/url`, data)

// 강사 - 파일 재업로드로 챕터 수정
export const updateLectureByUpload = (courseId: number, lectureId: number, title: string, file: File): Promise<Lecture> => {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)
  return api.put(`/api/instructor/courses/${courseId}/lectures/${lectureId}/upload`, form, {
    headers: { 'Content-Type': undefined },
  })
}

// 강사 - 챕터 삭제
export const deleteLecture = (courseId: number, lectureId: number): Promise<void> =>
  api.delete(`/api/instructor/courses/${courseId}/lectures/${lectureId}`)

// 강사 - 챕터 목록 조회
export const getInstructorLectures = (courseId: number): Promise<Lecture[]> =>
  api.get(`/api/instructor/courses/${courseId}/lectures`)
