import api from './axios'

export interface Enrollment {
  id: number
  courseId: number
  courseTitle: string
  thumbnailUrl: string | null
  instructorName: string
  progressPercent: number
  enrolledAt: string
}

export const enroll = (courseId: number): Promise<void> =>
  api.post('/api/enrollments', { courseId })

export const getMyEnrollments = (): Promise<Enrollment[]> =>
  api.get('/api/enrollments/me')

export const checkEnrollment = (courseId: number): Promise<boolean> =>
  api.get(`/api/enrollments/${courseId}/status`)

export const updateProgress = (courseId: number, progressPercent: number): Promise<Enrollment> =>
  api.patch(`/api/enrollments/${courseId}/progress`, { progressPercent })
