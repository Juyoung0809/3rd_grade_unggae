import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyPayments, type PaymentHistory } from '../api/payments'
import NavBar from '../components/NavBar'

export default function PaymentHistoryPage() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true)
      setError('')
      try {
        const data = await getMyPayments()
        setPayments(data)
      } catch {
        setError('결제 내역을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const totalAmount = payments.reduce((sum, p) => sum + p.paidPrice, 0)
  const freeCount = payments.filter((p) => p.paidPrice === 0).length
  const paidCount = payments.filter((p) => p.paidPrice > 0).length

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* ── 페이지 히어로 ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">결제 기록</p>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-5">결제 내역</h1>

          {!loading && payments.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">전체 결제</p>
                  <p className="text-lg font-extrabold text-slate-800 leading-none">{payments.length}건</p>
                </div>
              </div>
              {paidCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 rounded-xl">
                  <div>
                    <p className="text-xs text-indigo-500">총 결제 금액</p>
                    <p className="text-lg font-extrabold text-indigo-700 leading-none">{totalAmount.toLocaleString()}원</p>
                  </div>
                </div>
              )}
              {freeCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl">
                  <div>
                    <p className="text-xs text-emerald-600">무료 수강</p>
                    <p className="text-lg font-extrabold text-emerald-700 leading-none">{freeCount}건</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 animate-pulse">
                <div className="w-24 h-16 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && payments.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-700 font-semibold text-base mb-2">결제 내역이 없어요</p>
            <p className="text-slate-400 text-sm mb-6">강의를 수강 신청하면 여기에 기록됩니다</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200"
            >
              강의 둘러보기
            </button>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.paymentId}
                onClick={() => navigate(`/courses/${payment.courseId}`)}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* 썸네일 */}
                <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0">
                  {payment.thumbnailUrl ? (
                    <img
                      src={payment.thumbnailUrl}
                      alt={payment.courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">EditHub</span>
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {payment.courseTitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {payment.instructorName}
                    <span className="mx-1.5 text-slate-300">·</span>
                    {payment.courseCategory}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(payment.paidAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* 금액 & 상태 */}
                <div className="shrink-0 text-right space-y-1">
                  <p className={`text-base font-extrabold ${payment.paidPrice === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {payment.paidPrice === 0 ? '무료' : `${Number(payment.paidPrice).toLocaleString()}원`}
                  </p>
                  <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    결제 완료
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
