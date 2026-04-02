package juyoung.unggae.rating.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.rating.dto.RatingRequest;
import juyoung.unggae.rating.dto.RatingResponse;
import juyoung.unggae.rating.dto.RatingUpdateRequest;
import juyoung.unggae.rating.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Tag(name = "Rating", description = "강의 평점(후기) 등록/조회/수정 API")
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @Operation(summary = "평점 등록", description = "수강 중인 강의에 평점(1~5)과 후기를 등록합니다. 강의당 1인 1평점만 가능합니다. [JWT 필요]")
    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponse>> addRating(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody RatingRequest request) {
        RatingResponse response = ratingService.addRating(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("평점이 등록되었습니다.", response));
    }

    @Operation(summary = "강의 평점 목록 조회", description = "특정 강의의 모든 평점 목록을 최신순으로 반환합니다. (인증 불필요)")
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getCourseRatings(
            @Parameter(description = "조회할 강의 ID") @PathVariable Long courseId) {
        List<RatingResponse> responses = ratingService.getCourseRatings(courseId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "내 평점 조회", description = "특정 강의에 대한 본인의 평점을 반환합니다. 등록한 평점이 없으면 null을 반환합니다. [JWT 필요]")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<RatingResponse>> getMyRating(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "조회할 강의 ID") @RequestParam Long courseId) {
        Optional<RatingResponse> response = ratingService.getMyRating(userId, courseId);
        return response
                .map(r -> ResponseEntity.ok(ApiResponse.success(r)))
                .orElse(ResponseEntity.ok(ApiResponse.success(null)));
    }

    @Operation(summary = "평점 수정", description = "본인이 등록한 평점의 점수와 후기를 수정합니다. [JWT 필요]")
    @PutMapping("/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponse>> updateRating(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "수정할 평점 ID") @PathVariable Long ratingId,
            @Valid @RequestBody RatingUpdateRequest request) {
        RatingResponse response = ratingService.updateRating(userId, ratingId, request);
        return ResponseEntity.ok(ApiResponse.success("평점이 수정되었습니다.", response));
    }
}
