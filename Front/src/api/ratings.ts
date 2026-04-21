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
  courseId?: number
  score: number
  comment?: string
}

export interface RatingUpdateRequest {
  score: number
  comment?: string
}

// 새 경로: /api/courses/{courseId}/reviews
export const addReview = (courseId: number, data: { score: number; comment?: string }): Promise<Rating> =>
  api.post(`/api/courses/${courseId}/reviews`, data)

export const getCourseReviews = (courseId: number): Promise<Rating[]> =>
  api.get(`/api/courses/${courseId}/reviews`)

export const getMyReview = (courseId: number): Promise<Rating | null> =>
  (api.get(`/api/courses/${courseId}/reviews/my`) as Promise<Rating>).catch(() => null)

export const updateReview = (courseId: number, reviewId: number, data: RatingUpdateRequest): Promise<Rating> =>
  api.put(`/api/courses/${courseId}/reviews/${reviewId}`, data)

export const deleteReview = (courseId: number, reviewId: number): Promise<void> =>
  api.delete(`/api/courses/${courseId}/reviews/${reviewId}`)

// 하위 호환 (기존 /api/ratings 경로)
export const addRating = (data: RatingRequest): Promise<Rating> =>
  api.post('/api/ratings', data)

export const getCourseRatings = (courseId: number): Promise<Rating[]> =>
  api.get(`/api/ratings/courses/${courseId}`)

export const getMyRating = (courseId: number): Promise<Rating | null> =>
  (api.get(`/api/ratings/my?courseId=${courseId}`) as Promise<Rating>).catch(() => null)

export const updateRating = (ratingId: number, data: RatingUpdateRequest): Promise<Rating> =>
  api.put(`/api/ratings/${ratingId}`, data)

export const deleteRating = (ratingId: number): Promise<void> =>
  api.delete(`/api/ratings/${ratingId}`)
