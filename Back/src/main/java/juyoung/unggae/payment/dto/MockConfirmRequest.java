package juyoung.unggae.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MockConfirmRequest {

    @NotBlank
    private String orderId;
}
