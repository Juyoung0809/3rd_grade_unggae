import api from './axios'
import type { Lecture } from './lectures'

export interface Section {
  id: number
  title: string
  orderNum: number
  lectures: Lecture[]
}

export const getCourseSections = (courseId: number): Promise<Section[]> =>
  api.get(`/api/courses/${courseId}/sections`)

export const createSection = (courseId: number, data: { title: string }): Promise<Section> =>
  api.post(`/api/courses/${courseId}/sections`, data)

export const updateSection = (sectionId: number, data: { title: string }): Promise<Section> =>
  api.put(`/api/sections/${sectionId}`, data)

export const deleteSection = (sectionId: number): Promise<void> =>
  api.delete(`/api/sections/${sectionId}`)

export const reorderSections = (courseId: number, orderedIds: number[]): Promise<void> =>
  api.patch(`/api/courses/${courseId}/sections/order`, { orderedIds })

// 섹션 내 레슨 관리
export const createLessonByUrl = (
  sectionId: number,
  data: { title: string; videoType: 'URL'; videoUrl: string }
): Promise<Lecture> =>
  api.post(`/api/sections/${sectionId}/lessons/url`, data)

export const createLessonByUpload = (sectionId: number, title: string, file: File): Promise<Lecture> => {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)
  return api.post(`/api/sections/${sectionId}/lessons/upload`, form, {
    headers: { 'Content-Type': undefined },
  })
}

export const updateLessonByUrl = (
  sectionId: number,
  lectureId: number,
  data: { title: string; videoType: 'URL'; videoUrl: string }
): Promise<Lecture> =>
  api.put(`/api/sections/${sectionId}/lessons/${lectureId}/url`, data)

export const updateLessonByUpload = (sectionId: number, lectureId: number, title: string, file: File): Promise<Lecture> => {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)
  return api.put(`/api/sections/${sectionId}/lessons/${lectureId}/upload`, form, {
    headers: { 'Content-Type': undefined },
  })
}

export const deleteLesson = (sectionId: number, lectureId: number): Promise<void> =>
  api.delete(`/api/sections/${sectionId}/lessons/${lectureId}`)

export const reorderLessons = (sectionId: number, orderedIds: number[]): Promise<void> =>
  api.patch(`/api/sections/${sectionId}/lessons/order`, { orderedIds })
