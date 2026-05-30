package juyoung.unggae.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.payment.dto.*;
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

    @Operation(summary = "결제 준비 (orderId 생성)")
    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<TossPrepareResponse>> prepare(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody TossPrepareRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.prepare(userId, request.getCourseId())));
    }

    @Operation(summary = "토스페이먼츠 결제 확정 (실제 PG 연동)")
    @PostMapping("/toss/confirm")
    public ResponseEntity<ApiResponse<TossConfirmResponse>> confirmToss(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody TossConfirmRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.confirmToss(userId, request)));
    }

    @Operation(summary = "Mock 결제 확정 (개발/테스트용 - PG 없이 바로 완료)")
    @PostMapping("/mock-confirm")
    public ResponseEntity<ApiResponse<TossConfirmResponse>> confirmMock(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody MockConfirmRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.confirmMock(userId, request.getOrderId())));
    }

    @Operation(summary = "내 결제 내역 조회")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PaymentHistoryResponse>>> getMyPayments(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getMyPayments(userId)));
    }
}
