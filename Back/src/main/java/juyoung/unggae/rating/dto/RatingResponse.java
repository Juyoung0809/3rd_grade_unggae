package juyoung.unggae.rating.dto;

import juyoung.unggae.rating.entity.Rating;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class RatingResponse {

    private final Long id;
    private final int score;
    private final String comment;
    private final String authorName;
    private final LocalDateTime createdAt;

    private RatingResponse(Rating rating) {
        this.id = rating.getId();
        this.score = rating.getScore();
        this.comment = rating.getComment();
        this.authorName = rating.getUser().getName();
        this.createdAt = rating.getCreatedAt();
    }

    public static RatingResponse from(Rating rating) {
        return new RatingResponse(rating);
    }
}
