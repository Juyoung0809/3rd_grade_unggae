package juyoung.unggae.enrollment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ProgressRequest {

    @NotNull
    @Min(0) @Max(100)
    private Integer progressPercent;
}
