package juyoung.unggae.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class EnrollmentRequest {

    @NotNull(message = "강의 ID를 입력해주세요.")
    private Long courseId;
}
