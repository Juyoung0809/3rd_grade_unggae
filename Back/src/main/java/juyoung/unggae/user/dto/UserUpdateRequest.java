package juyoung.unggae.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UserUpdateRequest {

    @Size(max = 50, message = "닉네임은 50자 이내여야 합니다.")
    private String nickname;

    private String bio;
}
