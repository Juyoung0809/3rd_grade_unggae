package juyoung.unggae.admin.service;

import juyoung.unggae.admin.dto.AdminPaymentResponse;
import juyoung.unggae.common.exception.CustomException;
import juyoung.unggae.common.response.ErrorCode;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// P3 — 결제모듈: @Service 비활성화 (Phase 7에서 활성화)
// @Service
@RequiredArgsConstructor
@Transactional
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> getAllPayments() {
        return paymentRepository.findAllOrderByPaidAtDesc()
                .stream()
                .map(AdminPaymentResponse::from)
                .collect(Collectors.toList());
    }

    public AdminPaymentResponse cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR));
        payment.cancel();
        return AdminPaymentResponse.from(payment);
    }
}
