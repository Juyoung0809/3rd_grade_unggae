import { Link } from 'react-router-dom'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">결제 완료!</h1>
        <p className="text-gray-500 mb-6">강의 수강을 시작할 수 있습니다.</p>
        <Link
          to="/my/enrollments"
          className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          내 강의 목록
        </Link>
      </div>
    </div>
  )
}
