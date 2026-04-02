package juyoung.unggae.course.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Schema(description = "강의 등록 요청")
@Getter
@NoArgsConstructor
public class CourseCreateRequest {

    @Schema(description = "강의 제목", example = "프리미어 프로 기초 완성")
    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @Schema(description = "강의 설명", example = "영상편집 입문자를 위한 프리미어 프로 기초 강의입니다.")
    private String description;

    @Schema(description = "카테고리 (YOUTUBE | SHORTS | MOTION | COLOR | THUMBNAIL)", example = "YOUTUBE")
    @NotBlank(message = "카테고리를 선택해주세요.")
    private String category;

    @Schema(description = "수강 가격 (0이면 무료)", example = "49000")
    @NotNull(message = "가격을 입력해주세요.")
    private BigDecimal price;

    @Schema(description = "썸네일 이미지 URL", example = "https://example.com/thumbnail.jpg")
    private String thumbnail;

    @Schema(description = "강의 영상 수 (1 이상)", example = "10")
    @Min(value = 1, message = "강의 수는 1개 이상이어야 합니다.")
    private int lectureCount;
}
