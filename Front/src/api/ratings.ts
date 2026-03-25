import api from './axios'

export interface Rating {
  id: number
  score: number
  comment: string | null
  authorName: string
  createdAt: string
}

export interface RatingRequest {
  courseId: number
  score: number
  comment?: string
}

export const addRating = (data: RatingRequest): Promise<Rating> =>
  api.post('/api/ratings', data)

export const getCourseRatings = (courseId: number): Promise<Rating[]> =>
  api.get(`/api/ratings/courses/${courseId}`)
