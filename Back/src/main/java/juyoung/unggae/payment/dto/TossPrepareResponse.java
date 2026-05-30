package juyoung.unggae.payment.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TossPrepareResponse {
    private String orderId;
    private String orderName;
    private BigDecimal amount;
    private String customerName;
}
