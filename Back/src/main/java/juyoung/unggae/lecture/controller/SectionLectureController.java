package juyoung.unggae.lecture.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.lecture.dto.LectureCreateRequest;
import juyoung.unggae.lecture.dto.LectureOrderRequest;
import juyoung.unggae.lecture.dto.LectureResponse;
import juyoung.unggae.lecture.dto.LectureUpdateRequest;
import juyoung.unggae.lecture.service.LectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Section Lecture", description = "섹션 내 강의 챕터(레슨) 관리 API [JWT 필요]")
@RestController
@RequestMapping("/api/sections/{sectionId}/lessons")
@RequiredArgsConstructor
public class SectionLectureController {

    private final LectureService lectureService;

    @Operation(summary = "섹션 내 레슨 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureResponse>>> getLessons(
            @PathVariable Long sectionId) {
        return ResponseEntity.ok(ApiResponse.success(lectureService.getLecturesBySection(sectionId)));
    }

    @Operation(summary = "레슨 추가 (URL)")
    @PostMapping("/url")
    public ResponseEntity<ApiResponse<LectureResponse>> createByUrl(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @Valid @RequestBody LectureCreateRequest request) {
        LectureResponse response = lectureService.createSectionLectureByUrl(userId, sectionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("레슨이 추가됐습니다.", response));
    }

    @Operation(summary = "레슨 추가 (파일 업로드)")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LectureResponse>> createByUpload(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {
        LectureResponse response = lectureService.createSectionLectureByUpload(userId, sectionId, title, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("레슨이 추가됐습니다.", response));
    }

    @Operation(summary = "레슨 수정 (URL)")
    @PutMapping("/{lectureId}/url")
    public ResponseEntity<ApiResponse<LectureResponse>> updateByUrl(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @PathVariable Long lectureId,
            @Valid @RequestBody LectureUpdateRequest request) {
        LectureResponse response = lectureService.updateLectureByUrl(userId, lectureId, request);
        return ResponseEntity.ok(ApiResponse.success("레슨이 수정됐습니다.", response));
    }

    @Operation(summary = "레슨 수정 (파일 재업로드)")
    @PutMapping(value = "/{lectureId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LectureResponse>> updateByUpload(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @PathVariable Long lectureId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {
        LectureResponse response = lectureService.updateLectureByUpload(userId, lectureId, title, file);
        return ResponseEntity.ok(ApiResponse.success("레슨이 수정됐습니다.", response));
    }

    @Operation(summary = "레슨 삭제")
    @DeleteMapping("/{lectureId}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @PathVariable Long lectureId) {
        lectureService.deleteLecture(userId, lectureId);
        return ResponseEntity.ok(ApiResponse.success("레슨이 삭제됐습니다.", null));
    }

    @Operation(summary = "레슨 순서 변경")
    @PatchMapping("/order")
    public ResponseEntity<ApiResponse<Void>> reorderLessons(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long sectionId,
            @Valid @RequestBody LectureOrderRequest request) {
        lectureService.reorderSectionLectures(userId, sectionId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
