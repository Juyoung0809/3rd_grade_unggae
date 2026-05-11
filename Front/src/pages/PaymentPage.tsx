import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCourseDetail, type Course } from '../api/courses'
import { preparePayment, confirmPayment, type PaymentPrepare } from '../api/payments'
import { useAuth } from '../store/AuthContext'
import NavBar from '../components/NavBar'

const CATEGORY_LABEL: Record<string, string> = {
  YOUTUBE: '유튜브 영상',
  SHORTS: '쇼츠 영상',
  POST_PRODUCTION: '영상 후반작업',
  ADVERTISEMENT: '광고·홍보 영상',
  AI: 'AI 영상',
  EVENT: '행사 영상',
  INDUSTRY: '업종별 영상',
  MOTION: '모션그래픽',
  MUSIC: '음악·음원',
  SOUND: '기타 음향·음악',
  COLOR: '색보정',
  THUMBNAIL: '썸네일',
  VLOG: '브이로그',
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const courseId = Number(searchParams.get('courseId'))
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [prepareData, setPrepareData] = useState<PaymentPrepare | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) {
      navigate('/auth')
      return
    }
    if (!courseId) {
      navigate('/courses')
      return
    }

    async function fetchData() {
      setPageLoading(true)
      setError('')
      try {
        const [courseData, prepare] = await Promise.all([
          getCourseDetail(courseId),
          preparePayment(courseId),
        ])
        if (courseData.price === 0) {
          navigate(`/courses/${courseId}`)
          return
        }
        setCourse(courseData)
        setPrepareData(prepare)
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        if (msg?.includes('이미')) {
          navigate(`/courses/${courseId}`)
          return
        }
        setError(msg ?? '결제 초기화에 실패했습니다.')
      } finally {
        setPageLoading(false)
      }
    }

    fetchData()
  }, [courseId, accessToken])

  async function handlePay() {
    if (!course || !user || !prepareData) return
    setPaying(true)
    setError('')
    try {
      await confirmPayment({
        paymentKey: 'DEMO_' + prepareData.orderId,
        orderId: prepareData.orderId,
        amount: prepareData.amount,
        courseId,
      })
      navigate(
        `/payment/success?paymentKey=DEMO_${prepareData.orderId}&orderId=${prepareData.orderId}&amount=${prepareData.amount}&courseId=${courseId}`
      )
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? '결제 중 오류가 발생했습니다.')
      setPaying(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">결제 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-3">{error}</p>
            <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-5 py-6">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">결제</p>
          <h1 className="text-xl font-extrabold text-slate-900">수강 결제</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 왼쪽: 강의 요약 */}
          <div className="lg:col-span-2 space-y-4">
            {course && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center">
                      <span className="text-white text-xl font-extrabold">
                        Edit<span className="text-indigo-200">Hub</span>
                      </span>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {CATEGORY_LABEL[course.category] ?? course.category}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 leading-snug">{course.title}</h2>
                    <p className="text-xs text-slate-500">강사: {course.instructor.name}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">주문 내역</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">강의 금액</span>
                    <span className="font-semibold text-slate-800">{Number(course.price).toLocaleString()}원</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">최종 결제금액</span>
                    <span className="text-xl font-extrabold text-indigo-600">{Number(course.price).toLocaleString()}원</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 오른쪽: 결제 수단 */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">결제 수단</h3>

              <div className="flex items-center gap-3 p-4 border-2 border-indigo-500 rounded-xl bg-indigo-50">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-semibold text-indigo-700">신용카드 / 체크카드</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">결제 안내</p>
                <p>· 결제 완료 후 즉시 수강이 가능합니다.</p>
                <p>· 환불은 관리자 페이지를 통해 처리됩니다.</p>
                <p>· 수강 시작 후 7일 이내 환불 신청이 가능합니다.</p>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-extrabold rounded-2xl transition-colors shadow-lg shadow-indigo-200"
            >
              {paying ? '결제 처리 중...' : `${Number(course?.price ?? 0).toLocaleString()}원 결제하기`}
            </button>

            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="w-full py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              강의로 돌아가기
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
