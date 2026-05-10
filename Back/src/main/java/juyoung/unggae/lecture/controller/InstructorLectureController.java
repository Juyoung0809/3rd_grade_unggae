package juyoung.unggae.lecture.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.lecture.dto.LectureCreateRequest;
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

@Tag(name = "Instructor Lecture", description = "강사 강의 챕터 관리 API [JWT 필요]")
@RestController
@RequestMapping("/api/instructor/courses/{courseId}/lectures")
@RequiredArgsConstructor
public class InstructorLectureController {

    private final LectureService lectureService;

    @Operation(summary = "강의 챕터 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureResponse>>> getLectures(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(lectureService.getLectures(courseId)));
    }

    @Operation(summary = "강의 챕터 추가 (URL)")
    @PostMapping("/url")
    public ResponseEntity<ApiResponse<LectureResponse>> createByUrl(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @Valid @RequestBody LectureCreateRequest request) {
        LectureResponse response = lectureService.createLectureByUrl(userId, courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("챕터가 추가됐습니다.", response));
    }

    @Operation(summary = "강의 챕터 추가 (파일 업로드)")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LectureResponse>> createByUpload(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {
        LectureResponse response = lectureService.createLectureByUpload(userId, courseId, title, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("챕터가 추가됐습니다.", response));
    }

    @Operation(summary = "강의 챕터 수정 (URL)")
    @PutMapping("/{lectureId}/url")
    public ResponseEntity<ApiResponse<LectureResponse>> updateByUrl(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @PathVariable Long lectureId,
            @Valid @RequestBody LectureUpdateRequest request) {
        LectureResponse response = lectureService.updateLectureByUrl(userId, lectureId, request);
        return ResponseEntity.ok(ApiResponse.success("챕터가 수정됐습니다.", response));
    }

    @Operation(summary = "강의 챕터 수정 (파일 재업로드)")
    @PutMapping(value = "/{lectureId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LectureResponse>> updateByUpload(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @PathVariable Long lectureId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {
        LectureResponse response = lectureService.updateLectureByUpload(userId, lectureId, title, file);
        return ResponseEntity.ok(ApiResponse.success("챕터가 수정됐습니다.", response));
    }

    @Operation(summary = "강의 챕터 삭제")
    @DeleteMapping("/{lectureId}")
    public ResponseEntity<ApiResponse<Void>> deleteLecture(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @PathVariable Long lectureId) {
        lectureService.deleteLecture(userId, lectureId);
        return ResponseEntity.ok(ApiResponse.success("챕터가 삭제됐습니다.", null));
    }
}
