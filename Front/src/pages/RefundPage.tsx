import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { cancelEnrollment, type Enrollment } from '../api/enrollments'

interface LocationState {
  enrollment: Enrollment
  reason: string
}

export default function RefundPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  if (!state?.enrollment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center py-40 text-slate-400 text-sm">
          잘못된 접근입니다.
        </div>
      </div>
    )
  }

  const { enrollment, reason } = state
  const refundAmount = enrollment.coursePrice

  async function handleRefund() {
    setProcessing(true)
    setErr('')
    try {
      await cancelEnrollment(enrollment.courseId)
      setDone(true)
    } catch {
      setErr('환불 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setProcessing(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="max-w-md mx-auto px-5 py-20 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">환불 신청이 완료되었습니다</h2>
          <p className="text-sm text-slate-500 mb-6">
            환불 금액 <strong>{refundAmount.toLocaleString()}원</strong>은 영업일 기준 3~5일 내 처리됩니다.
          </p>
          <button
            onClick={() => navigate('/my/enrollments')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            내 강의로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-md mx-auto px-5 py-10">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1">
          ← 뒤로가기
        </button>

        <h1 className="text-xl font-bold text-slate-900 mb-6">환불 신청</h1>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">강의</p>
            <p className="text-sm font-semibold text-slate-800">{enrollment.courseTitle}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">강사</p>
            <p className="text-sm text-slate-700">{enrollment.instructorName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">환불 금액</p>
            <p className="text-base font-bold text-indigo-600">{refundAmount.toLocaleString()}원</p>
          </div>
          {reason && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">취소 사유</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{reason}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          환불 신청 후 수강 취소가 즉시 처리되며, 환불 금액은 영업일 기준 3~5일 내 결제 수단으로 반환됩니다.
        </p>

        {err && <p className="text-sm text-red-500 mt-3">{err}</p>}

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleRefund}
            disabled={processing}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
          >
            {processing ? '처리 중...' : '환불 신청'}
          </button>
        </div>
      </div>
    </div>
  )
}
