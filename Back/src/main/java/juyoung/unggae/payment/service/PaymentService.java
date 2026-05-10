package juyoung.unggae.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.course.repository.CourseRepository;
import juyoung.unggae.enrollment.dto.EnrollmentResponse;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import juyoung.unggae.payment.dto.PaymentConfirmRequest;
import juyoung.unggae.payment.dto.PaymentHistoryResponse;
import juyoung.unggae.payment.dto.PaymentPrepareRequest;
import juyoung.unggae.payment.dto.PaymentPrepareResponse;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import juyoung.unggae.user.entity.User;
import juyoung.unggae.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

// P3 — 결제모듈: @Service 비활성화 (Phase 6에서 활성화)
// @Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${toss.secret-key}")
    private String tossSecretKey;

    @Value("${toss.client-key}")
    private String tossClientKey;

    public Payment createPayment(User user, Course course) {
        Payment.PaymentMethod method = course.getPrice().compareTo(BigDecimal.ZERO) == 0
                ? Payment.PaymentMethod.FREE
                : Payment.PaymentMethod.CARD;

        Payment payment = Payment.builder()
                .user(user)
                .course(course)
                .paidPrice(course.getPrice())
                .method(method)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByPaidAtDesc(userId)
                .stream()
                .map(PaymentHistoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentPrepareResponse preparePayment(Long userId, PaymentPrepareRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != Course.Status.PUBLISHED) {
            throw new CustomException(ErrorCode.COURSE_NOT_PUBLISHED);
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new CustomException(ErrorCode.ALREADY_ENROLLED);
        }

        String orderId = "order-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        return new PaymentPrepareResponse(orderId, course.getPrice(), course.getTitle(), tossClientKey);
    }

    public EnrollmentResponse confirmTossPayment(Long userId, PaymentConfirmRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getPrice().compareTo(request.getAmount()) != 0) {
            throw new CustomException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        verifyWithToss(request.getPaymentKey(), request.getOrderId(), request.getAmount().longValue());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Enrollment enrollment;
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            enrollment = Enrollment.builder()
                    .user(user)
                    .course(course)
                    .paidPrice(request.getAmount())
                    .build();
            enrollmentRepository.save(enrollment);

            Payment payment = Payment.builder()
                    .user(user)
                    .course(course)
                    .paidPrice(request.getAmount())
                    .method(Payment.PaymentMethod.CARD)
                    .build();
            paymentRepository.save(payment);
        } else {
            enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, request.getCourseId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED));
        }

        return EnrollmentResponse.from(enrollment);
    }

    private void verifyWithToss(String paymentKey, String orderId, long amount) {
        String authHeader = "Basic " + Base64.getEncoder()
                .encodeToString((tossSecretKey + ":").getBytes());

        try {
            String body = objectMapper.writeValueAsString(
                    Map.of("paymentKey", paymentKey, "orderId", orderId, "amount", amount));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.tosspayments.com/v1/payments/confirm"))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new CustomException(ErrorCode.PAYMENT_FAILED);
            }
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.PAYMENT_FAILED);
        }
    }
}
