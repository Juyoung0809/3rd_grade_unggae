package juyoung.unggae.course.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.course.dto.CourseCreateRequest;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.dto.CourseUpdateRequest;
import juyoung.unggae.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Course", description = "강의 API")
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @Operation(
            summary = "강의 목록 조회",
            description = "PUBLISHED 상태의 강의 목록을 반환합니다. sort: LATEST(최신순) | RATING(평점순) | STUDENTS(수강생순)"
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "LATEST") String sort) {
        List<CourseResponse> responses = courseService.getCourses(category, keyword, sort);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "강의 상세 조회")
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseDetail(
            @Parameter(description = "강의 ID") @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourseDetail(courseId)));
    }

    @Operation(summary = "강의 등록 (강사 전용)", description = "PENDING 상태로 생성, 관리자 승인 후 PUBLISHED")
    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CourseCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("강의가 등록되었습니다.", courseService.createCourse(userId, request)));
    }

    @Operation(summary = "강의 수정 (강사 전용)")
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @Valid @RequestBody CourseUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("강의가 수정되었습니다.", courseService.updateCourse(userId, courseId, request)));
    }

    @Operation(summary = "강의 삭제 (강사 전용, 소프트 삭제)")
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        courseService.deleteCourse(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("강의가 삭제되었습니다.", null));
    }
}
