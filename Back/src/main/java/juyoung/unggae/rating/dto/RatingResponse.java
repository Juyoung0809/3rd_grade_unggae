package juyoung.unggae.rating.dto;

import juyoung.unggae.rating.entity.Rating;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class RatingResponse {

    private final Long id;
    private final int score;
    private final String comment;
    private final Long authorId;
    private final String authorName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private RatingResponse(Rating rating) {
        this.id = rating.getId();
        this.score = rating.getScore();
        this.comment = rating.getComment();
        this.authorId = rating.getUser().getId();
        this.authorName = rating.getUser().getNickname();
        this.createdAt = rating.getCreatedAt();
        this.updatedAt = rating.getUpdatedAt();
    }

    public static RatingResponse from(Rating rating) {
        return new RatingResponse(rating);
    }
}
