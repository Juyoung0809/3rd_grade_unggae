package juyoung.unggae.rating.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class RatingRequest {

    @NotNull
    private Long courseId;

    @NotNull
    @Min(1) @Max(5)
    private Integer score;

    private String comment;
}
