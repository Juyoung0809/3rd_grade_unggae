package juyoung.unggae.admin.service;

import juyoung.unggae.admin.dto.AdminPaymentResponse;
import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import juyoung.unggae.payment.service.TossPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final TossPaymentService tossPaymentService;

    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> getAllPayments() {
        return paymentRepository.findAllOrderByPaidAtDesc()
                .stream()
                .map(AdminPaymentResponse::from)
                .collect(Collectors.toList());
    }

    public AdminPaymentResponse cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new CustomException(ErrorCode.PAYMENT_NOT_COMPLETED);
        }

        if (payment.getMethod() == Payment.PaymentMethod.TOSS && payment.getPaymentKey() != null) {
            try {
                tossPaymentService.cancel(payment.getPaymentKey(), "관리자 환불 처리");
                log.info("Toss 결제 취소 성공: paymentKey={}", payment.getPaymentKey());
            } catch (Exception e) {
                log.error("Toss 결제 취소 실패: paymentKey={}, error={}", payment.getPaymentKey(), e.getMessage());
                throw new CustomException(ErrorCode.PAYMENT_CANCEL_FAILED);
            }
        }

        payment.cancel();
        return AdminPaymentResponse.from(payment);
    }
}
