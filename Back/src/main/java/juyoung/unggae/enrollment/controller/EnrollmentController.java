package juyoung.unggae.enrollment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.enrollment.dto.EnrollmentRequest;
import juyoung.unggae.enrollment.dto.EnrollmentResponse;
import juyoung.unggae.enrollment.dto.PaymentResponse;
import juyoung.unggae.enrollment.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Enrollment", description = "수강 신청 및 진도 관리 API [JWT 필요]")
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @Operation(summary = "수강 신청")
    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enroll(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("강의 신청이 완료되었습니다.", response));
    }

    @Operation(summary = "내 수강 목록 조회")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMyEnrollments(
            @AuthenticationPrincipal Long userId) {
        List<EnrollmentResponse> responses = enrollmentService.getMyEnrollments(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "수강 중인 강의 ID 목록 조회")
    @GetMapping("/enrolled-course-ids")
    public ResponseEntity<ApiResponse<List<Long>>> getEnrolledCourseIds(
            @AuthenticationPrincipal Long userId) {
        List<Long> ids = enrollmentService.getEnrolledCourseIds(userId);
        return ResponseEntity.ok(ApiResponse.success(ids));
    }

    @Operation(summary = "결제 내역 조회")
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal Long userId) {
        List<PaymentResponse> responses = enrollmentService.getMyPayments(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "수강 여부 확인")
    @GetMapping("/{courseId}/status")
    public ResponseEntity<ApiResponse<Boolean>> checkEnrollment(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "확인할 강의 ID") @PathVariable Long courseId) {
        boolean enrolled = enrollmentService.isEnrolled(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(enrolled));
    }

    @Operation(summary = "수강 상세 조회")
    @GetMapping("/{courseId}/detail")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollmentDetail(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "조회할 강의 ID") @PathVariable Long courseId) {
        EnrollmentResponse response = enrollmentService.getEnrollmentDetail(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "완료한 강의 챕터 ID 목록 조회")
    @GetMapping("/{courseId}/completed-lectures")
    public ResponseEntity<ApiResponse<List<Long>>> getCompletedLectureIds(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        List<Long> ids = enrollmentService.getCompletedLectureIds(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(ids));
    }

    @Operation(summary = "수강 취소", description = "수강 중인 강의를 취소합니다.")
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> cancelEnrollment(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "취소할 강의 ID") @PathVariable Long courseId) {
        enrollmentService.cancelEnrollment(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("수강이 취소되었습니다.", null));
    }

    @Operation(summary = "강의 챕터 완료 처리", description = "동영상 시청 완료 시 해당 챕터를 완료 처리합니다. 중복 요청은 무시됩니다.")
    @PostMapping("/{courseId}/complete-lecture/{lectureId}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> completeLecture(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @PathVariable Long lectureId) {
        EnrollmentResponse response = enrollmentService.completeLecture(userId, courseId, lectureId);
        return ResponseEntity.ok(ApiResponse.success("강의를 완료했습니다.", response));
    }
}
