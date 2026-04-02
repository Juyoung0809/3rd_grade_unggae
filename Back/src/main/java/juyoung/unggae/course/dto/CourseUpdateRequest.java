package juyoung.unggae.course.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Schema(description = "강의 수정 요청 (모든 필드 교체)")
@Getter
@NoArgsConstructor
public class CourseUpdateRequest {

    @Schema(description = "강의 제목", example = "프리미어 프로 심화 과정")
    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @Schema(description = "강의 설명", example = "중급자를 위한 심화 편집 기술을 다룹니다.")
    private String description;

    @Schema(description = "카테고리 (YOUTUBE | SHORTS | MOTION | COLOR | THUMBNAIL)", example = "YOUTUBE")
    @NotBlank(message = "카테고리를 선택해주세요.")
    private String category;

    @Schema(description = "수강 가격 (0이면 무료)", example = "79000")
    @NotNull(message = "가격을 입력해주세요.")
    private BigDecimal price;

    @Schema(description = "썸네일 이미지 URL", example = "https://example.com/thumbnail2.jpg")
    private String thumbnail;

    @Schema(description = "강의 영상 수 (1 이상)", example = "15")
    @Min(value = 1, message = "강의 수는 1개 이상이어야 합니다.")
    private int lectureCount;
}
