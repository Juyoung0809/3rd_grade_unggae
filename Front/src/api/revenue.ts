import api from './axios'

export interface MonthlyStatResponse {
  year: number
  month: number
  revenue: number
  salesCount: number
}

export interface RevenueSummary {
  totalRevenue: number
  thisMonthRevenue: number
  totalSalesCount: number
  monthlyStats: MonthlyStatResponse[]
}

export interface SaleRecord {
  enrollmentId: number
  studentNickname: string
  courseId: number
  courseTitle: string
  paidPrice: number
  enrolledAt: string
  status: 'ACTIVE' | 'CANCELLED'
}

export const getRevenueSummary = (): Promise<RevenueSummary> =>
  api.get('/api/instructor/revenue/summary')

export const getRevenueSales = (courseId?: number): Promise<SaleRecord[]> =>
  api.get('/api/instructor/revenue/sales', { params: courseId != null ? { courseId } : {} })
