package juyoung.unggae.admin.dto;

import jakarta.validation.constraints.NotNull;
import juyoung.unggae.user.entity.User;
import lombok.Getter;

@Getter
public class UserStatusUpdateRequest {

    @NotNull(message = "상태를 선택해주세요.")
    private User.Status status;
}
