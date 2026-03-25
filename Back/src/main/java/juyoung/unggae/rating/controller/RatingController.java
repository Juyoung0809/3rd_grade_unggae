package juyoung.unggae.rating.controller;

import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.rating.dto.RatingRequest;
import juyoung.unggae.rating.dto.RatingResponse;
import juyoung.unggae.rating.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponse>> addRating(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody RatingRequest request) {
        RatingResponse response = ratingService.addRating(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("평점이 등록되었습니다.", response));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getCourseRatings(
            @PathVariable Long courseId) {
        List<RatingResponse> responses = ratingService.getCourseRatings(courseId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
