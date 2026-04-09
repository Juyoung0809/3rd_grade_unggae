import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from './store/AuthContext'
import AuthPage from './pages/AuthPage'
import CourseListPage from './pages/CourseListPage'
import CourseDetailPage from './pages/CourseDetailPage'
import MyEnrollmentsPage from './pages/MyEnrollmentsPage'
import InstructorCoursesPage from './pages/InstructorCoursesPage'
import PaymentHistoryPage from './pages/PaymentHistoryPage'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()
  return accessToken ? <>{children}</> : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route
          path="/my/enrollments"
          element={
            <PrivateRoute>
              <MyEnrollmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my/payments"
          element={
            <PrivateRoute>
              <PaymentHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <PrivateRoute>
              <InstructorCoursesPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
