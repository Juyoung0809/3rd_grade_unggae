import api from './axios'
import type { Course } from './courses'

export interface AdminUser {
  id: number
  email: string
  nickname: string
  role: string
  status: string
  createdAt: string
}

export interface AdminPayment {
  paymentId: number
  userId: number
  userNickname: string
  userEmail: string
  courseId: number
  courseTitle: string
  instructorNickname: string
  paidPrice: number
  paidAt: string
  method: string
  status: string
}

export const getAllCourses = (): Promise<Course[]> =>
  api.get('/api/admin/courses')

export const getPendingCourses = (): Promise<Course[]> =>
  api.get('/api/admin/courses/pending')

export const approveCourse = (courseId: number): Promise<Course> =>
  api.put(`/api/admin/courses/${courseId}/approve`)

export const rejectCourse = (courseId: number): Promise<Course> =>
  api.put(`/api/admin/courses/${courseId}/reject`)

export const getAllUsers = (): Promise<AdminUser[]> =>
  api.get('/api/admin/users')

export const updateUserStatus = (userId: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<AdminUser> =>
  api.put(`/api/admin/users/${userId}/status`, { status })

export const updateUserRole = (userId: number, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'): Promise<AdminUser> =>
  api.put(`/api/admin/users/${userId}/role`, { role })

export const getAllPayments = (): Promise<AdminPayment[]> =>
  api.get('/api/admin/payments')

export const cancelPayment = (paymentId: number): Promise<AdminPayment> =>
  api.post(`/api/admin/payments/${paymentId}/cancel`)
