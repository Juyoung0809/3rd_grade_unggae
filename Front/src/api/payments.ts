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

export interface PaymentPrepare {
  orderId: string
  amount: number
  orderName: string
  clientKey: string
}

export interface PaymentConfirmData {
  paymentKey: string
  orderId: string
  amount: number
  courseId: number
}

export const getMyPayments = (): Promise<PaymentHistory[]> =>
  api.get('/api/payments/my')

export const preparePayment = (courseId: number): Promise<PaymentPrepare> =>
  api.post('/api/payments/prepare', { courseId })

export const confirmPayment = (data: PaymentConfirmData): Promise<void> =>
  api.post('/api/payments/confirm', data)
