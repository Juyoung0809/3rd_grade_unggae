package juyoung.unggae.payment.service;

import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.payment.dto.PaymentHistoryResponse;
import juyoung.unggae.payment.dto.TossConfirmRequest;
import juyoung.unggae.payment.dto.TossConfirmResponse;
import juyoung.unggae.payment.dto.TossPrepareResponse;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import juyoung.unggae.user.entity.User;
import juyoung.unggae.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TossPaymentService tossPaymentService;

    /** 결제 준비 - orderId 생성 후 PENDING 저장 */
    public TossPrepareResponse prepare(Long userId, Long courseId) {
        log.info("[Payment] prepare 요청: userId={}, courseId={}", userId, courseId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new CustomException(ErrorCode.COURSE_NOT_PUBLISHED);
        }
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new CustomException(ErrorCode.ALREADY_ENROLLED);
        }

        String orderId = UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .user(user)
                .course(course)
                .orderId(orderId)
                .paidPrice(course.getPrice())
                .method(Payment.PaymentMethod.TOSS)
                .status(Payment.PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return TossPrepareResponse.builder()
                .orderId(orderId)
                .orderName(course.getTitle())
                .amount(course.getPrice())
                .customerName(user.getNickname())
                .build();
    }

    /** 토스페이먼츠 결제 확정 (실제 PG 검증) */
    public TossConfirmResponse confirmToss(Long userId, TossConfirmRequest request) {
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ADMIN_FORBIDDEN);
        }
        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new CustomException(ErrorCode.PAYMENT_ALREADY_DONE);
        }
        if (payment.getPaidPrice().compareTo(request.getAmount()) != 0) {
            throw new CustomException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        try {
            Map<String, Object> tossResult = tossPaymentService.confirm(
                    request.getPaymentKey(), request.getOrderId(), request.getAmount());
            log.info("Toss 결제 확정 성공: orderId={}", request.getOrderId());
        } catch (Exception e) {
            payment.fail();
            log.error("Toss 결제 확정 실패: orderId={}, error={}", request.getOrderId(), e.getMessage());
            throw new CustomException(ErrorCode.PAYMENT_CONFIRM_FAILED);
        }

        payment.confirm(request.getPaymentKey());
        createEnrollment(payment);
        return TossConfirmResponse.from(payment);
    }

    /** Mock 결제 확정 - PG 연동 없이 바로 완료 처리 (개발/테스트용) */
    public TossConfirmResponse confirmMock(Long userId, String orderId) {
        log.info("[Payment] mock-confirm 요청: userId={}, orderId={}", userId, orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ADMIN_FORBIDDEN);
        }
        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new CustomException(ErrorCode.PAYMENT_ALREADY_DONE);
        }

        payment.confirm("mock-" + UUID.randomUUID().toString().substring(0, 8));
        createEnrollment(payment);
        log.info("[Mock] 결제 확정: orderId={}, userId={}", orderId, userId);
        return TossConfirmResponse.from(payment);
    }

    private void createEnrollment(Payment payment) {
        if (!enrollmentRepository.existsByUserIdAndCourseId(
                payment.getUser().getId(), payment.getCourse().getId())) {
            Enrollment enrollment = Enrollment.builder()
                    .user(payment.getUser())
                    .course(payment.getCourse())
                    .paidPrice(payment.getPaidPrice())
                    .build();
            enrollmentRepository.save(enrollment);
        }
    }

    /** 무료 강의 결제 레코드 생성 */
    public Payment createFreePayment(User user, Course course) {
        Payment payment = Payment.builder()
                .user(user)
                .course(course)
                .paidPrice(BigDecimal.ZERO)
                .method(Payment.PaymentMethod.FREE)
                .status(Payment.PaymentStatus.PENDING)
                .build();
        payment.confirm(null);
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByPaidAtDesc(userId)
                .stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED
                        || p.getStatus() == Payment.PaymentStatus.REFUNDED)
                .map(PaymentHistoryResponse::from)
                .collect(Collectors.toList());
    }
}
