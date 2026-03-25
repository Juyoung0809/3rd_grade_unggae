package juyoung.unggae.enrollment.controller;

import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.enrollment.dto.EnrollmentRequest;
import juyoung.unggae.enrollment.dto.EnrollmentResponse;
import juyoung.unggae.enrollment.dto.ProgressRequest;
import juyoung.unggae.enrollment.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enroll(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("강의 신청이 완료되었습니다.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMyEnrollments(
            @AuthenticationPrincipal Long userId) {
        List<EnrollmentResponse> responses = enrollmentService.getMyEnrollments(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{courseId}/status")
    public ResponseEntity<ApiResponse<Boolean>> checkEnrollment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        boolean enrolled = enrollmentService.isEnrolled(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(enrolled));
    }

    @PatchMapping("/{courseId}/progress")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateProgress(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @Valid @RequestBody ProgressRequest request) {
        EnrollmentResponse response = enrollmentService.updateProgress(userId, courseId, request);
        return ResponseEntity.ok(ApiResponse.success("진도율이 업데이트되었습니다.", response));
    }
}
