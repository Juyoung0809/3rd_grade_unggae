package juyoung.unggae.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TossPrepareRequest {

    @NotNull
    private Long courseId;
}
