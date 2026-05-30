import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { confirmTossPayment } from '../api/payments'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [courseId, setCourseId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId    = searchParams.get('orderId')
    const amount     = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      setStatus('error')
      return
    }

    confirmTossPayment(paymentKey, orderId, Number(amount))
      .then(res => {
        setCourseId(res.courseId)
        setStatus('done')
      })
      .catch(err => {
        setErrorMsg(err?.response?.data?.message || '결제 확인 중 오류가 발생했습니다.')
        setStatus('error')
      })
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">결제를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h1>
          <p className="text-gray-500 mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate(-2)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">결제 완료!</h1>
        <p className="text-gray-500 mb-6">강의 수강을 시작할 수 있습니다.</p>
        <div className="space-y-3">
          {courseId && (
            <Link
              to={`/courses/${courseId}`}
              className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              강의 바로 가기
            </Link>
          )}
          <Link
            to="/my/enrollments"
            className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            내 강의 목록
          </Link>
        </div>
      </div>
    </div>
  )
}
