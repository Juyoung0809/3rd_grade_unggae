package juyoung.unggae.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.admin.service.AdminCourseService;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.course.dto.CourseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin", description = "관리자 API [JWT + ADMIN 권한 필요]")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCourseController {

    private final AdminCourseService adminCourseService;

    @Operation(summary = "전체 강의 목록 조회 (모든 상태)")
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(adminCourseService.getAllCourses(userId)));
    }

    @Operation(summary = "승인 대기 강의 목록 조회")
    @GetMapping("/courses/pending")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPendingCourses(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(adminCourseService.getPendingCourses(userId)));
    }

    @Operation(summary = "강의 승인")
    @PutMapping("/courses/{courseId}/approve")
    public ResponseEntity<ApiResponse<CourseResponse>> approveCourse(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success("강의가 승인되었습니다.", adminCourseService.approveCourse(userId, courseId)));
    }

    @Operation(summary = "강의 거절")
    @PutMapping("/courses/{courseId}/reject")
    public ResponseEntity<ApiResponse<CourseResponse>> rejectCourse(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success("강의가 거절되었습니다.", adminCourseService.rejectCourse(userId, courseId)));
    }
}
