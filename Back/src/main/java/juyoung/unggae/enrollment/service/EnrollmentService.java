package juyoung.unggae.enrollment.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.dto.EnrollmentRequest;
import juyoung.unggae.enrollment.dto.EnrollmentResponse;
import juyoung.unggae.enrollment.dto.PaymentResponse;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.entity.LectureCompletion;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.enrollment.repository.LectureCompletionRepository;
import juyoung.unggae.payment.service.PaymentService;
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
    private final LectureCompletionRepository lectureCompletionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

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

        Enrollment saved = enrollmentRepository.save(enrollment);
        paymentService.createPayment(user, course);
        return EnrollmentResponse.from(saved);
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

    /** 특정 강의 챕터 완료 처리 (idempotent) */
    public EnrollmentResponse completeLecture(Long userId, Long courseId, Long lectureId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED));

        if (!lectureCompletionRepository.existsByEnrollmentIdAndLectureId(enrollment.getId(), lectureId)) {
            LectureCompletion completion = LectureCompletion.builder()
                    .enrollment(enrollment)
                    .lectureId(lectureId)
                    .build();
            lectureCompletionRepository.save(completion);

            int completedCount = lectureCompletionRepository.countByEnrollmentId(enrollment.getId());
            enrollment.updateProgress(completedCount);
        }

        return EnrollmentResponse.from(enrollment);
    }

    /** 완료한 강의 챕터 ID 목록 조회 */
    @Transactional(readOnly = true)
    public List<Long> getCompletedLectureIds(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED));
        return lectureCompletionRepository.findLectureIdsByEnrollmentId(enrollment.getId());
    }

    public void cancelEnrollment(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED));

        if (enrollment.getStatus() != Enrollment.Status.ACTIVE) {
            throw new CustomException(ErrorCode.ENROLLMENT_NOT_ACTIVE);
        }

        enrollment.cancel();
    }

    /** 수강 중인 강의 ID 목록 조회 */
    @Transactional(readOnly = true)
    public List<Long> getEnrolledCourseIds(Long userId) {
        return enrollmentRepository.findActiveEnrollmentsByUserId(userId)
                .stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(Long userId) {
        return enrollmentRepository.findAllEnrollmentsByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }
}
