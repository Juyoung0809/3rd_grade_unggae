package juyoung.unggae.enrollment.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.dto.EnrollmentRequest;
import juyoung.unggae.enrollment.dto.EnrollmentResponse;
import juyoung.unggae.enrollment.dto.PaymentResponse;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.user.entity.User;
import juyoung.unggae.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentResponse enroll(Long userId, EnrollmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new CustomException(ErrorCode.COURSE_NOT_PUBLISHED);
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new CustomException(ErrorCode.ALREADY_ENROLLED);
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .paidPrice(course.getPrice())
                .build();

        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(Long userId) {
        return enrollmentRepository.findActiveEnrollmentsByUserId(userId)
                .stream()
                .map(EnrollmentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long userId, Long courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollmentDetail(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED));
        return EnrollmentResponse.from(enrollment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(Long userId) {
        return enrollmentRepository.findAllEnrollmentsByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    public EnrollmentResponse completeLecture(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED));
        enrollment.completeLecture();
        return EnrollmentResponse.from(enrollment);
    }
}
