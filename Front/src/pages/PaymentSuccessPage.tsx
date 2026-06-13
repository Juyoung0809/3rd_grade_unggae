import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { confirmTossPayment, type ConfirmResponse } from '../api/payments'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState<ConfirmResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const requestedRef = useRef(false)

  const courseId = searchParams.get('courseId')

  useEffect(() => {
    if (requestedRef.current) return
    requestedRef.current = true

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    confirmTossPayment({ paymentKey, orderId, amount: Number(amount) })
      .then(setResult)
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg || '결제 확인 중 오류가 발생했습니다.')
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gray-500">결제 확인 중...</div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">결제 확인 실패</h1>
          <p className="text-gray-500 mb-6">{error || '결제 확인 중 오류가 발생했습니다.'}</p>
          <Link
            to={courseId ? `/payment/${courseId}` : '/courses'}
            className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            다시 시도하기
          </Link>
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
          <Link
            to={`/courses/${result.courseId}`}
            className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            강의 보러 가기
          </Link>
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
