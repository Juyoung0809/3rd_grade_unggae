package juyoung.unggae.payment.controller;

import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/toss")
@RequiredArgsConstructor
public class TossWebhookController {

    private final PaymentRepository paymentRepository;

    /**
     * 토스페이먼츠 웹훅 수신 (결제 상태 동기화)
     * 토스 대시보드에서 이 URL을 웹훅 엔드포인트로 등록하세요.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Void>> handleWebhook(@RequestBody Map<String, Object> payload) {
        String eventType = (String) payload.get("eventType");
        Map<String, Object> data = (Map<String, Object>) payload.get("data");

        log.info("[Toss Webhook] eventType={}", eventType);

        if (data == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }

        String orderId = (String) data.get("orderId");
        String status  = (String) data.get("status");

        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            if ("DONE".equals(status) && payment.getStatus() == Payment.PaymentStatus.PENDING) {
                String paymentKey = (String) data.get("paymentKey");
                payment.confirm(paymentKey);
                log.info("[Toss Webhook] 결제 확정: orderId={}", orderId);
            } else if ("CANCELED".equals(status) && payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                payment.cancel();
                log.info("[Toss Webhook] 결제 취소: orderId={}", orderId);
            } else if ("ABORTED".equals(status) || "EXPIRED".equals(status)) {
                payment.fail();
                log.info("[Toss Webhook] 결제 실패/만료: orderId={}, status={}", orderId, status);
            }
        });

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
