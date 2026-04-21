package juyoung.unggae.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.admin.dto.AdminPaymentResponse;
import juyoung.unggae.admin.service.AdminPaymentService;
import juyoung.unggae.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin", description = "관리자 API [JWT + ADMIN 권한 필요]")
@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    @Operation(summary = "전체 결제 내역 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminPaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(adminPaymentService.getAllPayments()));
    }

    @Operation(summary = "결제 취소 (환불 처리)")
    @PostMapping("/{paymentId}/cancel")
    public ResponseEntity<ApiResponse<AdminPaymentResponse>> cancelPayment(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(ApiResponse.success("결제가 취소되었습니다.", adminPaymentService.cancelPayment(paymentId)));
    }
}
