import { useSearchParams, useNavigate } from 'react-router-dom'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const errorCode    = searchParams.get('code') || ''
  const errorMessage = searchParams.get('message') || '결제가 취소되었습니다.'
  const courseId     = searchParams.get('courseId')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-500 mb-1">{errorMessage}</p>
        {errorCode && (
          <p className="text-xs text-gray-400 mb-6">오류 코드: {errorCode}</p>
        )}
        <div className="space-y-3">
          <button
            onClick={() => navigate(courseId ? `/payment/${courseId}` : '/courses')}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            강의 목록으로
          </button>
        </div>
      </div>
    </div>
  )
}
