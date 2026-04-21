package juyoung.unggae.section.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SectionCreateRequest {

    @NotBlank(message = "섹션 제목을 입력해주세요.")
    @Size(max = 200, message = "섹션 제목은 200자 이내여야 합니다.")
    private String title;
}
