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

export const getEnrolledCourseIds = (): Promise<number[]> =>
  api.get('/api/enrollments/enrolled-course-ids')

export const checkEnrollment = (courseId: number): Promise<boolean> =>
  api.get(`/api/enrollments/${courseId}/status`)

export const getEnrollmentDetail = (courseId: number): Promise<Enrollment> =>
  api.get(`/api/enrollments/${courseId}/detail`)

export const getCompletedLectureIds = (courseId: number): Promise<number[]> =>
  api.get(`/api/enrollments/${courseId}/completed-lectures`)

export const completeLecture = (courseId: number, lectureId: number): Promise<Enrollment> =>
  api.post(`/api/enrollments/${courseId}/complete-lecture/${lectureId}`)

export const cancelEnrollment = (courseId: number): Promise<void> =>
  api.delete(`/api/enrollments/${courseId}`)
