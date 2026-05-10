package juyoung.unggae.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class PaymentPrepareResponse {
    private final String orderId;
    private final BigDecimal amount;
    private final String orderName;
    private final String clientKey;
}
