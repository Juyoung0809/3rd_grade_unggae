package juyoung.unggae.course.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Course (Public)", description = "강의 공개 조회 API (인증 불필요)")
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @Operation(
            summary = "강의 목록 조회",
            description = "PUBLISHED 상태의 강의 목록을 반환합니다. 카테고리(YOUTUBE/SHORTS/MOTION/COLOR/THUMBNAIL)와 키워드로 필터링할 수 있습니다."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCourses(
            @Parameter(description = "카테고리 필터 (YOUTUBE | SHORTS | MOTION | COLOR | THUMBNAIL)")
            @RequestParam(required = false) String category,
            @Parameter(description = "제목/설명 검색 키워드")
            @RequestParam(required = false) String keyword) {
        List<CourseResponse> responses = courseService.getCourses(category, keyword);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "강의 상세 조회", description = "강의 ID로 상세 정보를 조회합니다. 평균 평점이 포함됩니다.")
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseDetail(
            @Parameter(description = "강의 ID") @PathVariable Long courseId) {
        CourseResponse response = courseService.getCourseDetail(courseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
