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
  method: 'FREE' | 'TOSS'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
}

export interface PrepareResponse {
  orderId: string
  orderName: string
  amount: number
  customerName: string
}

export interface ConfirmResponse {
  paymentId: number
  courseId: number
  status: string
  amount: number
  paidAt: string
}

export const getMyPayments = (): Promise<PaymentHistory[]> =>
  api.get('/api/payments/my')

export const preparePayment = (courseId: number): Promise<PrepareResponse> =>
  api.post('/api/payments/prepare', { courseId })

export const confirmMockPayment = (orderId: string): Promise<ConfirmResponse> =>
  api.post('/api/payments/mock-confirm', { orderId })
