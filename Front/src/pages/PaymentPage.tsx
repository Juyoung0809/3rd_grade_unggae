import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { preparePayment, confirmMockPayment } from '../api/payments'
import { getCourseDetail, type Course } from '../api/courses'

interface PaymentMethod {
  id: string
  label: string
  description: string
  badgeText: string
  badgeClassName: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'kakaopay', label: '카카오페이', description: '카카오톡으로 간편결제', badgeText: 'kakao', badgeClassName: 'bg-[#FEE500] text-[#3C1E1E]' },
  { id: 'tosspay', label: '토스페이', description: '토스 앱으로 간편결제', badgeText: 'toss', badgeClassName: 'bg-[#1B64DA] text-white' },
  { id: 'naverpay', label: '네이버페이', description: '네이버 아이디로 간편결제', badgeText: 'N Pay', badgeClassName: 'bg-[#03C75A] text-white' },
  { id: 'card', label: '신용·체크카드', description: '모든 카드사 결제 가능', badgeText: 'CARD', badgeClassName: 'bg-slate-800 text-white' },
  { id: 'transfer', label: '계좌이체', description: '실시간 계좌이체', badgeText: '이체', badgeClassName: 'bg-indigo-100 text-indigo-600' },
  { id: 'phone', label: '휴대폰 결제', description: '통신사 소액결제', badgeText: '폰', badgeClassName: 'bg-emerald-100 text-emerald-600' },
]

interface CardCompany {
  id: string
  label: string
  badgeText: string
  badgeClassName: string
}

const CARD_COMPANIES: CardCompany[] = [
  { id: 'lgpay', label: '엘지페이', badgeText: 'LG Pay', badgeClassName: 'bg-rose-50 text-rose-600' },
  { id: 'toss', label: '토스', badgeText: '토스', badgeClassName: 'bg-[#1B64DA] text-white' },
  { id: 'paybooc', label: '페이북', badgeText: '페이북', badgeClassName: 'bg-red-500 text-white' },
  { id: 'hyundai', label: '현대', badgeText: '현대', badgeClassName: 'bg-slate-900 text-white' },
  { id: 'shinhan', label: '신한', badgeText: '신한', badgeClassName: 'bg-blue-700 text-white' },
  { id: 'bc', label: '비씨(페이북)', badgeText: 'BC', badgeClassName: 'bg-red-600 text-white' },
  { id: 'kb', label: 'KB국민(KB pay)', badgeText: 'KB', badgeClassName: 'bg-yellow-400 text-slate-900' },
  { id: 'samsung', label: '삼성', badgeText: '삼성', badgeClassName: 'bg-slate-800 text-white' },
  { id: 'lotte', label: '롯데', badgeText: 'LOTTE', badgeClassName: 'bg-red-700 text-white' },
  { id: 'hana', label: '하나', badgeText: '1Q', badgeClassName: 'bg-green-600 text-white' },
  { id: 'nh', label: 'NH채움', badgeText: 'NH', badgeClassName: 'bg-green-500 text-white' },
  { id: 'woori', label: '우리', badgeText: '우리', badgeClassName: 'bg-sky-600 text-white' },
  { id: 'sh', label: '수협', badgeText: 'Sh', badgeClassName: 'bg-blue-500 text-white' },
]

const TERMS = ['전자금융거래 기본약관', '개인정보 수집 및 이용 동의', '개인정보 제공 안내']

export default function PaymentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [agreedAll, setAgreedAll] = useState(false)

  useEffect(() => {
    if (!courseId) return
    getCourseDetail(Number(courseId))
      .then(setCourse)
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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-700 font-semibold mb-2">{error || '강의 정보를 불러올 수 없습니다.'}</p>
          <button onClick={() => navigate('/courses')} className="text-sm text-indigo-600 hover:underline">
            강의 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod) ?? PAYMENT_METHODS[0]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ←
          </button>
          <h1 className="text-lg font-bold text-slate-900">주문/결제</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
          {/* 왼쪽: 주문 정보 + 결제 수단 */}
          <div className="lg:col-span-2 space-y-5">
            {/* 주문 상품 */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-4">주문 상품</h2>
              <div className="flex items-center gap-4">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-20 h-14 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-extrabold">EditHub</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{course.title}</p>
                  <p className="text-xs text-slate-400 mt-1">강사: {course.instructor.name}</p>
                </div>
              </div>
            </section>

            {/* 결제 수단 선택 */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-4">결제 수단</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-indigo-500 bg-indigo-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="accent-indigo-600 w-4 h-4 shrink-0"
                    />
                    <span className={`w-14 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${method.badgeClassName}`}>
                      {method.badgeText}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{method.label}</p>
                      <p className="text-xs text-slate-400">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

          </div>

          {/* 오른쪽: 결제 금액 요약 */}
          <div className="mt-5 lg:mt-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-20 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">결제 금액</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>강의 금액</span>
                  <span>{course.price.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>할인 금액</span>
                  <span>0원</span>
                </div>
                <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-900">총 결제 금액</span>
                  <span className="text-indigo-600 text-xl font-extrabold">{course.price.toLocaleString()}원</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCard(null)
                  setAgreedAll(false)
                  setError('')
                  setShowPaymentModal(true)
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
              >
                {course.price.toLocaleString()}원 결제하기
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                실제 결제가 이루어지지 않는 테스트 결제입니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 결제수단 상세 모달 (토스페이먼츠 결제창 스타일) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:px-4">
          <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{currentMethod.label}</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-5 sm:flex sm:gap-5">
              {selectedMethod === 'card' ? (
                <div className="sm:flex-1 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {CARD_COMPANIES.map((cardCompany) => (
                    <button
                      key={cardCompany.id}
                      onClick={() => setSelectedCard(cardCompany.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                        selectedCard === cardCompany.id
                          ? 'border-indigo-500 bg-indigo-50/60'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-12 h-8 rounded-md flex items-center justify-center text-[10px] font-extrabold ${cardCompany.badgeClassName}`}>
                        {cardCompany.badgeText}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">{cardCompany.label}</span>
                    </button>
                  ))}
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-100 opacity-50">
                    <span className="w-12 h-8 rounded-md flex items-center justify-center bg-slate-100 text-slate-400 text-lg">+</span>
                    <span className="text-[11px] text-slate-400 font-medium">더보기</span>
                  </div>
                </div>
              ) : (
                <div className="sm:flex-1 flex flex-col items-center justify-center gap-3 py-8">
                  <span className={`w-20 h-14 rounded-xl flex items-center justify-center text-base font-extrabold ${currentMethod.badgeClassName}`}>
                    {currentMethod.badgeText}
                  </span>
                  <p className="text-sm text-slate-500">{currentMethod.label}로 결제를 진행합니다.</p>
                </div>
              )}

              {/* 결제 정보 */}
              <div className="mt-5 sm:mt-0 sm:w-44 shrink-0 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">결제 금액</p>
                  <p className="text-lg font-extrabold text-slate-900">{course.price.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">상품명</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{course.title}</p>
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="border-t border-slate-100 px-5 py-4">
              <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={agreedAll}
                  onChange={(e) => setAgreedAll(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[11px] shrink-0 ${
                    agreedAll ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className="text-sm font-bold text-slate-800">전체 동의하기</span>
              </label>
              <ul className="space-y-1.5 pl-7">
                {TERMS.map((term) => (
                  <li key={term} className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span> {term}
                    </span>
                    <span>›</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 모달 버튼 */}
            <div className="flex gap-2 px-5 pb-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handlePay}
                disabled={paying || !agreedAll || (selectedMethod === 'card' && !selectedCard)}
                className="flex-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold transition-colors"
              >
                {paying ? '결제 처리 중...' : '다음'}
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-300 py-4">● toss payments</p>
          </div>
        </div>
      )}
    </div>
  )
}
