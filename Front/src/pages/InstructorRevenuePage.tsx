import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import NavBar from '../components/NavBar'
import { getRevenueSummary, getRevenueSales } from '../api/revenue'
import type { RevenueSummary, SaleRecord } from '../api/revenue'

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function InstructorRevenuePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [courseOptions, setCourseOptions] = useState<[number, string][]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/courses')
      return
    }
    fetchAll()
  }, [user])

  useEffect(() => {
    if (!summary) return
    fetchSales(selectedCourseId)
  }, [selectedCourseId])

  async function fetchAll() {
    try {
      setLoading(true)
      const [summaryData, salesData] = await Promise.all([
        getRevenueSummary(),
        getRevenueSales(),
      ])
      setSummary(summaryData)
      setSales(salesData)
      const options = Array.from(
        new Map(salesData.map((s) => [s.courseId, s.courseTitle])).entries()
      )
      setCourseOptions(options)
    } catch {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSales(courseId?: number) {
    try {
      const data = await getRevenueSales(courseId)
      setSales(data)
    } catch {
      setError('판매 내역을 불러오는 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <span className="text-slate-400 text-sm">불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-5xl mx-auto px-5 py-10 space-y-10">
        <h1 className="text-2xl font-bold text-slate-800">수익 대시보드</h1>

        {/* ── 요약 카드 3개 ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="총 수익"
            value={summary ? `₩${summary.totalRevenue.toLocaleString('ko-KR')}` : '—'}
            sub="취소 제외 누적 수익"
            color="indigo"
          />
          <SummaryCard
            label="이번 달 수익"
            value={summary ? `₩${summary.thisMonthRevenue.toLocaleString('ko-KR')}` : '—'}
            sub="이번 달 발생 수익"
            color="green"
          />
          <SummaryCard
            label="총 판매 건수"
            value={summary ? `${summary.totalSalesCount}건` : '—'}
            sub="취소 포함 전체 판매"
            color="violet"
          />
        </section>

        {/* ── 월별 수익 현황 ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-700">월별 수익 현황 <span className="text-xs font-normal text-slate-400">(최근 12개월, 취소 제외)</span></h2>
          </div>
          {summary && summary.monthlyStats.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="text-left px-6 py-3 font-medium">연/월</th>
                  <th className="text-right px-6 py-3 font-medium">수익 (₩)</th>
                  <th className="text-right px-6 py-3 font-medium">판매 건수</th>
                </tr>
              </thead>
              <tbody>
                {summary.monthlyStats.map((stat) => (
                  <tr
                    key={`${stat.year}-${stat.month}`}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-700 font-medium">
                      {stat.year}-{String(stat.month).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-800 font-semibold">
                      {stat.revenue.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {stat.salesCount}건
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-8 text-center text-slate-400 text-sm">아직 수익 데이터가 없습니다.</p>
          )}
        </section>

        {/* ── 판매 내역 ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-slate-700">판매 내역</h2>
            <select
              value={selectedCourseId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                setSelectedCourseId(val === '' ? undefined : Number(val))
              }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">강의 전체</option>
              {courseOptions.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </div>

          {sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="text-left px-6 py-3 font-medium">수강생</th>
                    <th className="text-left px-6 py-3 font-medium">강의명</th>
                    <th className="text-right px-6 py-3 font-medium">결제 금액</th>
                    <th className="text-right px-6 py-3 font-medium">등록일</th>
                    <th className="text-center px-6 py-3 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale.enrollmentId}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-slate-700 font-medium">{sale.studentNickname}</td>
                      <td className="px-6 py-3 text-slate-600 max-w-[200px] truncate">{sale.courseTitle}</td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-800">
                        {sale.paidPrice === 0 ? (
                          <span className="text-emerald-600">무료</span>
                        ) : (
                          `₩${sale.paidPrice.toLocaleString('ko-KR')}`
                        )}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-500">{formatDate(sale.enrolledAt)}</td>
                      <td className="px-6 py-3 text-center">
                        {sale.status === 'ACTIVE' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            수강 중
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            취소됨
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-slate-400 text-sm">판매 내역이 없습니다.</p>
          )}
        </section>
      </main>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string
  sub: string
  color: 'indigo' | 'green' | 'violet'
}

function SummaryCard({ label, value, sub, color }: SummaryCardProps) {
  const colorMap = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  }
  const valueColorMap = {
    indigo: 'text-indigo-800',
    green: 'text-emerald-800',
    violet: 'text-violet-800',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]}`}>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
      <p className="text-xs mt-1 opacity-70">{sub}</p>
    </div>
  )
}
