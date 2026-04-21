import api from './axios'

export interface PaymentHistory {
  paymentId: number
  courseId: number
  courseTitle: string
  thumbnailUrl: string | null
  courseCategory: string
  instructorName: string
  paidPrice: number
  paidAt: string
  method: 'FREE' | 'CARD'
  status: 'COMPLETED' | 'REFUNDED'
}

export const getMyPayments = (): Promise<PaymentHistory[]> =>
  api.get('/api/payments/my')
