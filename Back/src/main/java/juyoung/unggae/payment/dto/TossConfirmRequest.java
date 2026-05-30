package juyoung.unggae.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class TossConfirmRequest {

    @NotBlank
    private String paymentKey;

    @NotBlank
    private String orderId;

    @NotNull
    private BigDecimal amount;
}
