import api from './axios'

export interface Enrollment {
  id: number
  courseId: number
  courseTitle: string
  thumbnailUrl: string | null
  instructorName: string
  completedLectureCount: number
  lectureCount: number
  progressPercent: number
  enrolledAt: string
}

export const enroll = (courseId: number): Promise<void> =>
  api.post('/api/enrollments', { courseId })

export const getMyEnrollments = (): Promise<Enrollment[]> =>
  api.get('/api/enrollments/me')

export const checkEnrollment = (courseId: number): Promise<boolean> =>
  api.get(`/api/enrollments/${courseId}/status`)

export const getEnrollmentDetail = (courseId: number): Promise<Enrollment> =>
  api.get(`/api/enrollments/${courseId}/detail`)

export const completeLecture = (courseId: number): Promise<Enrollment> =>
  api.post(`/api/enrollments/${courseId}/complete-lecture`)
