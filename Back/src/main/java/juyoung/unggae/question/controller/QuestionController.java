package juyoung.unggae.question.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.common.response.ApiResponse;
import juyoung.unggae.question.dto.*;
import juyoung.unggae.question.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Question", description = "강의 질문 게시판 및 답변 API")
@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @Operation(summary = "질문 등록", description = "수강 중인 강의에 질문을 등록합니다. 수강생만 작성할 수 있습니다. [JWT 필요]")
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse response = questionService.createQuestion(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("질문이 등록되었습니다.", response));
    }

    @Operation(summary = "질문 수정", description = "본인이 등록한 질문의 제목과 내용을 수정합니다. [JWT 필요]")
    @PutMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "수정할 질문 ID") @PathVariable Long questionId,
            @Valid @RequestBody QuestionUpdateRequest request) {
        QuestionResponse response = questionService.updateQuestion(userId, questionId, request);
        return ResponseEntity.ok(ApiResponse.success("질문이 수정되었습니다.", response));
    }

    @Operation(summary = "강의별 질문 목록 조회", description = "특정 강의의 질문 목록을 최신순으로 반환합니다. 각 질문의 답변 수가 포함됩니다. (인증 불필요)")
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<List<QuestionSummaryResponse>>> getCourseQuestions(
            @Parameter(description = "조회할 강의 ID") @PathVariable Long courseId) {
        List<QuestionSummaryResponse> responses = questionService.getCourseQuestions(courseId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "질문 상세 조회", description = "질문 ID로 질문 내용과 모든 답변을 조회합니다. (인증 불필요)")
    @GetMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestion(
            @Parameter(description = "조회할 질문 ID") @PathVariable Long questionId) {
        QuestionResponse response = questionService.getQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
            summary = "답변 등록",
            description = "질문에 답변을 등록합니다. 수강생 또는 강사만 작성할 수 있습니다. 강사 계정으로 작성하면 강사 답변으로 표시됩니다. [JWT 필요]"
    )
    @PostMapping("/{questionId}/answers")
    public ResponseEntity<ApiResponse<AnswerResponse>> createAnswer(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "답변할 질문 ID") @PathVariable Long questionId,
            @Valid @RequestBody AnswerRequest request) {
        AnswerResponse response = questionService.createAnswer(userId, questionId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("답변이 등록되었습니다.", response));
    }

    @Operation(summary = "답변 수정", description = "본인이 등록한 답변의 내용을 수정합니다. [JWT 필요]")
    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<ApiResponse<AnswerResponse>> updateAnswer(
            @AuthenticationPrincipal Long userId,
            @Parameter(description = "질문 ID") @PathVariable Long questionId,
            @Parameter(description = "수정할 답변 ID") @PathVariable Long answerId,
            @Valid @RequestBody AnswerUpdateRequest request) {
        AnswerResponse response = questionService.updateAnswer(userId, answerId, request);
        return ResponseEntity.ok(ApiResponse.success("답변이 수정되었습니다.", response));
    }
}
