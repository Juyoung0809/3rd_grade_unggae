package juyoung.unggae.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PaymentPrepareRequest {

    @NotNull(message = "강의 ID는 필수입니다.")
    private Long courseId;
}
