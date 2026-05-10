package juyoung.unggae.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class PaymentConfirmRequest {

    @NotBlank(message = "paymentKey는 필수입니다.")
    private String paymentKey;

    @NotBlank(message = "orderId는 필수입니다.")
    private String orderId;

    @NotNull(message = "amount는 필수입니다.")
    private BigDecimal amount;

    @NotNull(message = "강의 ID는 필수입니다.")
    private Long courseId;
}
