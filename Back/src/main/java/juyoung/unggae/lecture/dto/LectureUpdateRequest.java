package juyoung.unggae.lecture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LectureUpdateRequest {

    @NotBlank
    private String title;

    @NotNull
    private String videoType; // "URL" or "UPLOAD"

    @NotBlank
    private String videoUrl;
}
