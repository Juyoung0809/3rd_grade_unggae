package juyoung.unggae.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.admin.dto.AdminStatsResponse;
import juyoung.unggae.admin.service.AdminStatsService;
import juyoung.unggae.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Stats", description = "관리자 통계 대시보드 [JWT + ADMIN 권한 필요]")
@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @Operation(summary = "서비스 주요 통계 조회", description = "총 회원수, 총 매출, 강의수 등 서비스 통계를 반환합니다. [ADMIN 전용]")
    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminStatsService.getStats()));
    }
}
