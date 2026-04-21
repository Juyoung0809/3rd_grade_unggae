package juyoung.unggae.rating.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RatingUpdateRequest {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer score;

    private String comment;
}
