import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { preparePayment, confirmMockPayment } from '../api/payments'
import { getCourseDetail } from '../api/courses'

export default function PaymentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<{ title: string; price: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!courseId) return
    getCourseDetail(Number(courseId))
      .then(c => setCourse({ title: c.title, price: c.price }))
      .catch(() => setError('강의 정보를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [courseId])

  const handlePay = async () => {
    if (!courseId) return
    setPaying(true)
    setError('')

    try {
      const prep = await preparePayment(Number(courseId))
      const result = await confirmMockPayment(prep.orderId)
      navigate(`/courses/${result.courseId}`, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setError(msg || '결제 중 오류가 발생했습니다.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">결제하기</h1>

        {course && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">강의</p>
            <p className="font-semibold text-gray-800">{course.title}</p>
            <p className="text-xl font-bold text-indigo-600 mt-2">
              {course.price.toLocaleString()}원
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition"
          >
            {paying ? '처리 중...' : '결제하기'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
