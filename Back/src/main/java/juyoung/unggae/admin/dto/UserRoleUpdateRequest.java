package juyoung.unggae.admin.dto;

import jakarta.validation.constraints.NotNull;
import juyoung.unggae.user.entity.User;
import lombok.Getter;

@Getter
public class UserRoleUpdateRequest {

    @NotNull(message = "역할을 선택해주세요.")
    private User.Role role;
}
