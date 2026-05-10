package juyoung.unggae.section.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class SectionOrderRequest {

    @NotEmpty(message = "섹션 순서 목록이 비어 있습니다.")
    private List<Long> orderedIds;
}
