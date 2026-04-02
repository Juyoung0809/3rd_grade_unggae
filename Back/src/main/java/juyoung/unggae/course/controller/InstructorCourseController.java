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

@Tag(name = "Instructor - Course", description = "강사 강의 관리 API [JWT 필요 / INSTRUCTOR 전용]")
@RestController
@RequestMapping("/api/instructor/courses")
@RequiredArgsConstructor
public class InstructorCourseController {

    private final CourseService courseService;

    @Operation(
            summary = "강의 등록",
            description = "강사가 새 강의를 등록합니다. 등록된 강의는 PENDING 상태로 생성되며, 관리자 승인 후 PUBLISHED됩니다."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CourseCreateRequest request) {
        CourseResponse response = courseService.createCourse(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("강의가 등록되었습니다.", response));
    }

    @Operation(
            summary = "내 강의 목록 조회",
            description = "로그인한 강사 본인의 강의 목록을 반환합니다. PENDING/PUBLISHED/REJECTED 모든 상태를 포함하며, DELETED는 제외됩니다."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getInstructorCourses(
            @AuthenticationPrincipal Long userId) {
        List<CourseResponse> responses = courseService.getInstructorCourses(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(
            summary = "강의 수정",
            description = "본인 강의의 제목, 설명, 카테고리, 가격, 썸네일, 강의 수를 수정합니다. 이미 삭제된 강의는 수정할 수 없습니다."
    )
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "수정할 강의 ID") @PathVariable Long courseId,
            @Valid @RequestBody CourseUpdateRequest request) {
        CourseResponse response = courseService.updateCourse(userId, courseId, request);
        return ResponseEntity.ok(ApiResponse.success("강의가 수정되었습니다.", response));
    }

    @Operation(
            summary = "강의 삭제 (소프트 삭제)",
            description = "강의를 DELETED 상태로 변경합니다. 실제 DB 레코드는 유지되며, 공개 목록과 강사 목록에서 제외됩니다."
    )
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "삭제할 강의 ID") @PathVariable Long courseId) {
        courseService.deleteCourse(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("강의가 삭제되었습니다.", null));
    }
}
