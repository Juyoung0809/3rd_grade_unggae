package juyoung.unggae.question.dto;

import juyoung.unggae.question.entity.Answer;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AnswerResponse {

    private final Long id;
    private final String content;
    private final Long authorId;
    private final String authorName;
    private final boolean instructorAnswer;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private AnswerResponse(Answer answer) {
        this.id = answer.getId();
        this.content = answer.getContent();
        this.authorId = answer.getAuthor().getId();
        this.authorName = answer.getAuthor().getName();
        this.instructorAnswer = answer.isInstructorAnswer();
        this.createdAt = answer.getCreatedAt();
        this.updatedAt = answer.getUpdatedAt();
    }

    public static AnswerResponse from(Answer answer) {
        return new AnswerResponse(answer);
    }
}
