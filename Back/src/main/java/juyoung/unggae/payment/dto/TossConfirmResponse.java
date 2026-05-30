package juyoung.unggae.payment.dto;

import juyoung.unggae.payment.entity.Payment;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class TossConfirmResponse {
    private Long paymentId;
    private Long courseId;
    private String status;
    private BigDecimal amount;
    private LocalDateTime paidAt;

    public static TossConfirmResponse from(Payment payment) {
        return TossConfirmResponse.builder()
                .paymentId(payment.getId())
                .courseId(payment.getCourse().getId())
                .status(payment.getStatus().name())
                .amount(payment.getPaidPrice())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
