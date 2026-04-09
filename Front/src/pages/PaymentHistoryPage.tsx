import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyPayments, type PaymentHistory } from '../api/enrollments'
import { useAuth } from '../store/AuthContext'

export default function PaymentHistoryPage() {
  const { user, logout } = useAuth()
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

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.paidPrice, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span
          className="font-bold text-gray-900 text-lg cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate('/courses')}
        >
          EditHub
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/my/enrollments')}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            내 강의
          </button>
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">결제 내역</h1>
          {payments.length > 0 && (
            <span className="text-sm text-gray-500">
              총 <span className="font-semibold text-gray-900">{payments.length}건</span>
              {' · '}
              <span className="font-semibold text-blue-600">
                {totalAmount === 0 ? '무료' : `${totalAmount.toLocaleString()}원`}
              </span>
            </span>
          )}
        </div>

        {loading && (
          <p className="text-gray-500 text-sm">불러오는 중...</p>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {!loading && !error && payments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">결제 내역이 없습니다.</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              강의 둘러보기
            </button>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.enrollmentId}
                onClick={() => navigate(`/courses/${payment.courseId}`)}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                {payment.thumbnailUrl ? (
                  <img
                    src={payment.thumbnailUrl}
                    alt={payment.courseTitle}
                    className="w-20 h-14 object-cover rounded-xl shrink-0"
                  />
                ) : (
                  <div className="w-20 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">EditHub</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{payment.courseTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{payment.instructorName} · {payment.courseCategory}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(payment.paidAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  <span className={`text-base font-bold ${payment.paidPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {payment.paidPrice === 0 ? '무료' : `${Number(payment.paidPrice).toLocaleString()}원`}
                  </span>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">결제 완료</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
