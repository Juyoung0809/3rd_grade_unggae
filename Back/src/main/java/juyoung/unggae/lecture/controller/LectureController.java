package juyoung.unggae.lecture.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.lecture.dto.LectureResponse;
import juyoung.unggae.lecture.service.LectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Lecture", description = "강의 챕터 조회 API")
@RestController
@RequestMapping("/api/courses/{courseId}/lectures")
@RequiredArgsConstructor
public class LectureController {

    private final LectureService lectureService;

    @Operation(summary = "강의 챕터 목록 조회 (공개)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LectureResponse>>> getLectures(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(lectureService.getLectures(courseId)));
    }
}
