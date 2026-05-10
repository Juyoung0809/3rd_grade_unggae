import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPayment } from '../api/payments'
import { getCourseDetail, type Course } from '../api/courses'
import NavBar from '../components/NavBar'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const paymentKey = searchParams.get('paymentKey') ?? ''
  const orderId = searchParams.get('orderId') ?? ''
  const amount = Number(searchParams.get('amount') ?? 0)
  const courseId = Number(searchParams.get('courseId') ?? 0)

  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming')
  const [course, setCourse] = useState<Course | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !courseId) {
      navigate('/courses')
      return
    }

    async function confirm() {
      try {
        const [courseData] = await Promise.all([
          getCourseDetail(courseId),
          confirmPayment({ paymentKey, orderId, amount, courseId }),
        ])
        setCourse(courseData)
        setStatus('success')
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setErrorMsg(msg ?? '결제 확인 중 오류가 발생했습니다.')
        setStatus('error')
      }
    }

    confirm()
  }, [])

  if (status === 'confirming') {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-700 font-semibold">결제를 확인하는 중...</p>
            <p className="text-slate-400 text-sm mt-1">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">결제 확인 실패</h2>
            <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/payment?courseId=${courseId}`)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                강의로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex items-center justify-center min-h-[60vh] px-5 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
          {/* 성공 배너 */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-white">결제 완료!</h1>
            <p className="text-emerald-100 text-sm mt-1">수강 등록이 완료되었습니다</p>
          </div>

          {/* 강의 정보 */}
          <div className="p-6 space-y-4">
            {course && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">EditHub</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-snug">{course.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course.instructor.name}</p>
                </div>
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">결제 금액</span>
                <span className="font-extrabold text-slate-900">{amount.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">주문 번호</span>
                <span className="text-xs text-slate-500 font-mono">{orderId}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-xl transition-colors shadow-md shadow-indigo-200"
              >
                수강 시작하기
              </button>
              <button
                onClick={() => navigate('/my/enrollments')}
                className="w-full py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                내 강의 목록 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
