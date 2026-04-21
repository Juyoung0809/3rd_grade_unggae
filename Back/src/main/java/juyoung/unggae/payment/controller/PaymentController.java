package juyoung.unggae.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.payment.dto.PaymentHistoryResponse;
import juyoung.unggae.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Payment", description = "결제 내역 API [JWT 필요]")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "내 결제 내역 조회")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PaymentHistoryResponse>>> getMyPayments(
            @AuthenticationPrincipal Long userId) {
        List<PaymentHistoryResponse> responses = paymentService.getMyPayments(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
