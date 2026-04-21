package juyoung.unggae.payment.service;

import juyoung.unggae.course.entity.Course;
import juyoung.unggae.payment.dto.PaymentHistoryResponse;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import juyoung.unggae.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

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
}
