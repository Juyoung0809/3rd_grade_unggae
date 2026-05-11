package juyoung.unggae.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.enrollment.dto.EnrollmentResponse;
import juyoung.unggae.payment.dto.PaymentConfirmRequest;
import juyoung.unggae.payment.dto.PaymentHistoryResponse;
import juyoung.unggae.payment.dto.PaymentPrepareRequest;
import juyoung.unggae.payment.dto.PaymentPrepareResponse;
import juyoung.unggae.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Payment", description = "결제 API [JWT 필요]")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "내 결제 내역 조회")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PaymentHistoryResponse>>> getMyPayments(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getMyPayments(userId)));
    }

    @Operation(summary = "결제 준비 (orderId 발급)")
    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<PaymentPrepareResponse>> preparePayment(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PaymentPrepareRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.preparePayment(userId, request)));
    }

    @Operation(summary = "결제 확정 (토스페이먼츠 검증 후 수강 등록)")
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> confirmPayment(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PaymentConfirmRequest request) {
        EnrollmentResponse response = paymentService.confirmTossPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("결제가 완료되었습니다.", response));
    }
}
