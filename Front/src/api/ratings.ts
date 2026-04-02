import api from './axios'

export interface Rating {
  id: number
  score: number
  comment: string | null
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export interface RatingRequest {
  courseId: number
  score: number
  comment?: string
}

export interface RatingUpdateRequest {
  score: number
  comment?: string
}

export const addRating = (data: RatingRequest): Promise<Rating> =>
  api.post('/api/ratings', data)

export const getCourseRatings = (courseId: number): Promise<Rating[]> =>
  api.get(`/api/ratings/courses/${courseId}`)

export const getMyRating = (courseId: number): Promise<Rating | null> =>
  (api.get(`/api/ratings/my?courseId=${courseId}`) as Promise<Rating>).catch(() => null)

export const updateRating = (ratingId: number, data: RatingUpdateRequest): Promise<Rating> =>
  api.put(`/api/ratings/${ratingId}`, data)
