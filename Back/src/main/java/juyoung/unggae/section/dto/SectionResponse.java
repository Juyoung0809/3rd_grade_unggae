package juyoung.unggae.section.dto;

import juyoung.unggae.lecture.dto.LectureResponse;
import juyoung.unggae.section.entity.Section;
import lombok.Getter;

import java.util.List;

@Getter
public class SectionResponse {

    private final Long id;
    private final String title;
    private final int orderNum;
    private final List<LectureResponse> lectures;

    private SectionResponse(Section section, List<LectureResponse> lectures) {
        this.id = section.getId();
        this.title = section.getTitle();
        this.orderNum = section.getOrderNum();
        this.lectures = lectures;
    }

    public static SectionResponse of(Section section, List<LectureResponse> lectures) {
        return new SectionResponse(section, lectures);
    }

    public static SectionResponse from(Section section) {
        return new SectionResponse(section, List.of());
    }
}
