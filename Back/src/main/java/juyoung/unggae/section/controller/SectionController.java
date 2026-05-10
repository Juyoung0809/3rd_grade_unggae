package juyoung.unggae.section.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.section.dto.SectionCreateRequest;
import juyoung.unggae.section.dto.SectionOrderRequest;
import juyoung.unggae.section.dto.SectionResponse;
import juyoung.unggae.section.dto.SectionUpdateRequest;
import juyoung.unggae.section.service.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Section", description = "강의 섹션 관리 API")
@RestController
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @Operation(summary = "섹션 목록 조회 (강의 챕터 포함)")
    @GetMapping("/api/courses/{courseId}/sections")
    public ResponseEntity<ApiResponse<List<SectionResponse>>> getSections(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(sectionService.getSections(courseId)));
    }

    @Operation(summary = "섹션 생성 (강사)")
    @PostMapping("/api/courses/{courseId}/sections")
    public ResponseEntity<ApiResponse<SectionResponse>> createSection(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @Valid @RequestBody SectionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(sectionService.createSection(userId, courseId, request)));
    }

    @Operation(summary = "섹션 수정 (강사)")
    @PutMapping("/api/sections/{sectionId}")
    public ResponseEntity<ApiResponse<SectionResponse>> updateSection(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @Valid @RequestBody SectionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sectionService.updateSection(userId, sectionId, request)));
    }

    @Operation(summary = "섹션 삭제 (강사)")
    @DeleteMapping("/api/sections/{sectionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSection(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId) {
        sectionService.deleteSection(userId, sectionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "섹션 순서 변경 (강사)")
    @PatchMapping("/api/courses/{courseId}/sections/order")
    public ResponseEntity<ApiResponse<Void>> reorderSections(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @Valid @RequestBody SectionOrderRequest request) {
        sectionService.reorderSections(userId, courseId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
