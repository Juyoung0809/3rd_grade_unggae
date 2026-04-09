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

    @Operation(summary = "수강 신청", description = "PUBLISHED 상태의 강의에 수강 신청합니다. 중복 신청은 불가합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enroll(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("강의 신청이 완료되었습니다.", response));
    }

    @Operation(summary = "내 수강 목록 조회", description = "로그인한 사용자의 수강 중인 강의 목록을 반환합니다.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMyEnrollments(
            @AuthenticationPrincipal Long userId) {
        List<EnrollmentResponse> responses = enrollmentService.getMyEnrollments(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "결제 내역 조회", description = "로그인한 사용자의 전체 결제(수강 신청) 내역을 최신순으로 반환합니다.")
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal Long userId) {
        List<PaymentResponse> responses = enrollmentService.getMyPayments(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "수강 여부 확인", description = "특정 강의에 수강 신청했는지 여부를 반환합니다.")
    @GetMapping("/{courseId}/status")
    public ResponseEntity<ApiResponse<Boolean>> checkEnrollment(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "확인할 강의 ID") @PathVariable Long courseId) {
        boolean enrolled = enrollmentService.isEnrolled(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(enrolled));
    }

    @Operation(summary = "수강 상세 조회", description = "특정 강의의 수강 정보(진도율, 완료 강의 수 등)를 반환합니다.")
    @GetMapping("/{courseId}/detail")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollmentDetail(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "조회할 강의 ID") @PathVariable Long courseId) {
        EnrollmentResponse response = enrollmentService.getEnrollmentDetail(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
            summary = "강의 완료 처리",
            description = "강의 1개를 완료 처리합니다. completedLectureCount가 1 증가하고 progressPercent가 자동 계산됩니다."
    )
    @PostMapping("/{courseId}/complete-lecture")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> completeLecture(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "완료 처리할 강의 ID") @PathVariable Long courseId) {
        EnrollmentResponse response = enrollmentService.completeLecture(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("강의를 완료했습니다.", response));
    }
}
