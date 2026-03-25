import api from './axios'

export interface Course {
  id: number
  title: string
  description: string
  price: number
  category: string
  thumbnailUrl: string | null
  averageRating: number
  status: string
  instructor: {
    id: number
    name: string
  }
}

export const getCourses = (params?: { category?: string; keyword?: string }): Promise<Course[]> =>
  api.get('/api/courses', { params })

export const getCourseDetail = (courseId: number): Promise<Course> =>
  api.get(`/api/courses/${courseId}`)
