package juyoung.unggae.question.dto;

import juyoung.unggae.question.entity.Question;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class QuestionSummaryResponse {

    private final Long id;
    private final Long courseId;
    private final String title;
    private final Long authorId;
    private final String authorName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final int answerCount;

    private QuestionSummaryResponse(Question question, int answerCount) {
        this.id = question.getId();
        this.courseId = question.getCourse().getId();
        this.title = question.getTitle();
        this.authorId = question.getAuthor().getId();
        this.authorName = question.getAuthor().getName();
        this.createdAt = question.getCreatedAt();
        this.updatedAt = question.getUpdatedAt();
        this.answerCount = answerCount;
    }

    public static QuestionSummaryResponse of(Question question, int answerCount) {
        return new QuestionSummaryResponse(question, answerCount);
    }
}
