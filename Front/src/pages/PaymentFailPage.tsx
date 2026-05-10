import { useSearchParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const code = searchParams.get('code') ?? ''
  const message = searchParams.get('message') ?? '결제에 실패했습니다.'
  const courseId = searchParams.get('courseId') ?? ''

  const isCancelled = code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL'

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex items-center justify-center min-h-[60vh] px-5 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
          {/* 실패 배너 */}
          <div className={`px-8 py-10 text-center ${isCancelled ? 'bg-gradient-to-br from-slate-500 to-slate-700' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {isCancelled ? (
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {isCancelled ? '결제 취소' : '결제 실패'}
            </h1>
            <p className={`text-sm mt-1 ${isCancelled ? 'text-slate-200' : 'text-red-100'}`}>
              {isCancelled ? '결제가 취소되었습니다' : '결제 처리 중 문제가 발생했습니다'}
            </p>
          </div>

          {/* 오류 정보 */}
          <div className="p-6 space-y-4">
            {!isCancelled && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-xs font-semibold text-red-500 mb-1">오류 내용</p>
                <p className="text-sm text-red-700">{decodeURIComponent(message)}</p>
                {code && (
                  <p className="text-xs text-red-400 mt-1 font-mono">코드: {code}</p>
                )}
              </div>
            )}

            {isCancelled && (
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <p className="text-sm text-slate-600">결제를 다시 시도하거나 강의 페이지로 돌아갈 수 있습니다.</p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {courseId && (
                <button
                  onClick={() => navigate(`/payment?courseId=${courseId}`)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl transition-colors shadow-md shadow-indigo-200"
                >
                  다시 결제하기
                </button>
              )}
              <button
                onClick={() => courseId ? navigate(`/courses/${courseId}`) : navigate('/courses')}
                className="w-full py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                강의로 돌아가기
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="w-full py-3 text-slate-400 text-sm hover:text-slate-600 transition-colors"
              >
                강의 목록 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
