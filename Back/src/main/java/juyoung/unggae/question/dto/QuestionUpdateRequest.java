package juyoung.unggae.question.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QuestionUpdateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
