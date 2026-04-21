package juyoung.unggae.question.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QuestionRequest {

    @NotNull
    private Long courseId;

    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
