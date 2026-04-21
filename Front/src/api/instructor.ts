import api from './axios'
import type { Course } from './courses'

export interface CourseFormData {
  title: string
  description: string
  category: string
  price: number
  thumbnail: string
}

export const createCourse = (data: CourseFormData): Promise<Course> =>
  api.post('/api/courses', data)

export const getInstructorCourses = (): Promise<Course[]> =>
  api.get('/api/instructor/courses')

export const updateCourse = (courseId: number, data: CourseFormData): Promise<Course> =>
  api.put(`/api/courses/${courseId}`, data)

export const deleteCourse = (courseId: number): Promise<void> =>
  api.delete(`/api/courses/${courseId}`)
