package juyoung.unggae.course.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.course.dto.CourseResponse;
import juyoung.unggae.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Instructor - Course", description = "강사 강의 관리 API [JWT 필요]")
@RestController
@RequestMapping("/api/instructor/courses")
@RequiredArgsConstructor
public class InstructorCourseController {

    private final CourseService courseService;

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
}
