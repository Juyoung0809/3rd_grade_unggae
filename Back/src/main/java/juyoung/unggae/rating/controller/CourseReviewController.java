package juyoung.unggae.rating.controller;

import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "Review", description = "강의 후기(평점) API")
@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
@RequiredArgsConstructor
public class CourseReviewController {

    private final RatingService ratingService;

    @Operation(summary = "후기 목록 조회 (공개)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getReviews(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(ratingService.getCourseRatings(courseId)));
    }

    @Operation(summary = "내 후기 조회")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<RatingResponse>> getMyReview(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        Optional<RatingResponse> response = ratingService.getMyRating(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(response.orElse(null)));
    }

    @Operation(summary = "후기 등록 (수강생 전용)")
    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponse>> addReview(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @Valid @RequestBody RatingRequest request) {
        RatingResponse response = ratingService.addRatingByCourse(userId, courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("후기가 등록되었습니다.", response));
    }

    @Operation(summary = "후기 수정")
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<RatingResponse>> updateReview(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @PathVariable Long reviewId,
            @Valid @RequestBody RatingUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("후기가 수정되었습니다.", ratingService.updateRating(userId, reviewId, request)));
    }

    @Operation(summary = "후기 삭제")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId,
            @PathVariable Long reviewId) {
        ratingService.deleteRating(userId, reviewId);
        return ResponseEntity.ok(ApiResponse.success("후기가 삭제되었습니다.", null));
    }
}
