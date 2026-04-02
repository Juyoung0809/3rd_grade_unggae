package juyoung.unggae.question.dto;

import juyoung.unggae.question.entity.Answer;
import juyoung.unggae.question.entity.Question;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class QuestionResponse {

    private final Long id;
    private final Long courseId;
    private final String title;
    private final String content;
    private final Long authorId;
    private final String authorName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<AnswerResponse> answers;

    private QuestionResponse(Question question, List<Answer> answers) {
        this.id = question.getId();
        this.courseId = question.getCourse().getId();
        this.title = question.getTitle();
        this.content = question.getContent();
        this.authorId = question.getAuthor().getId();
        this.authorName = question.getAuthor().getName();
        this.createdAt = question.getCreatedAt();
        this.updatedAt = question.getUpdatedAt();
        this.answers = answers.stream().map(AnswerResponse::from).collect(Collectors.toList());
    }

    public static QuestionResponse of(Question question, List<Answer> answers) {
        return new QuestionResponse(question, answers);
    }
}
