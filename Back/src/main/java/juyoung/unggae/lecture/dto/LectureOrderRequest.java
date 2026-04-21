package juyoung.unggae.lecture.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class LectureOrderRequest {

    @NotEmpty(message = "강의 챕터 순서 목록이 비어 있습니다.")
    private List<Long> orderedIds;
}
