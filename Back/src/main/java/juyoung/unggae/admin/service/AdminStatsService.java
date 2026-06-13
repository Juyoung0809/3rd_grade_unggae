package juyoung.unggae.admin.service;

import juyoung.unggae.admin.dto.AdminStatsResponse;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import juyoung.unggae.user.entity.User;
import juyoung.unggae.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;

    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole(User.Role.STUDENT))
                .totalInstructors(userRepository.countByRole(User.Role.INSTRUCTOR))
                .totalCourses(courseRepository.count())
                .publishedCourses(courseRepository.countByStatus(Course.Status.PUBLISHED))
                .pendingCourses(courseRepository.countByStatus(Course.Status.PENDING))
                .totalEnrollments(enrollmentRepository.countByStatus(Enrollment.Status.ACTIVE))
                .totalPayments(paymentRepository.countByStatus(Payment.PaymentStatus.COMPLETED))
                .totalRevenue(paymentRepository.sumCompletedPaidPrice())
                .build();
    }
}
