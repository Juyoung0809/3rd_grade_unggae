package juyoung.unggae.lecture.dto;

import juyoung.unggae.lecture.entity.Lecture;
import lombok.Getter;

@Getter
public class LectureResponse {

    private final Long id;
    private final Long sectionId;
    private final String title;
    private final int orderIndex;
    private final String videoType;
    private final String videoUrl;

    private LectureResponse(Lecture lecture) {
        this.id = lecture.getId();
        this.sectionId = lecture.getSection() != null ? lecture.getSection().getId() : null;
        this.title = lecture.getTitle();
        this.orderIndex = lecture.getOrderIndex();
        this.videoType = lecture.getVideoType().name();
        this.videoUrl = lecture.getVideoUrl();
    }

    public static LectureResponse from(Lecture lecture) {
        return new LectureResponse(lecture);
    }
}
