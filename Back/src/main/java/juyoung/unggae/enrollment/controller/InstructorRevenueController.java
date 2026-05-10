package juyoung.unggae.enrollment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.enrollment.dto.InstructorRevenueSummaryResponse;
import juyoung.unggae.enrollment.dto.InstructorSaleResponse;
import juyoung.unggae.enrollment.service.InstructorRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Instructor Revenue", description = "강사 수익 대시보드 API [JWT 필요]")
@RestController
@RequestMapping("/api/instructor/revenue")
@RequiredArgsConstructor
public class InstructorRevenueController {

    private final InstructorRevenueService instructorRevenueService;

    @Operation(summary = "수익 요약 + 월별 통계 조회")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<InstructorRevenueSummaryResponse>> getSummary(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.success(instructorRevenueService.getSummary(userId)));
    }

    @Operation(summary = "판매 내역 목록 조회", description = "courseId 없으면 전체 강의, 있으면 해당 강의만 반환")
    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<List<InstructorSaleResponse>>> getSales(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(instructorRevenueService.getSales(userId, courseId)));
    }
}
