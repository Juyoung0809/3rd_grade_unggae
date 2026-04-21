package juyoung.unggae.auth.dto;

import juyoung.unggae.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserInfo user;

    @Getter
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String nickname;
        private String role;
    }

    public static TokenResponse of(String accessToken, String refreshToken, long expiresIn, User user) {
        UserInfo userInfo = new UserInfo(user.getId(), user.getEmail(), user.getNickname(), user.getRole().name());
        return new TokenResponse(accessToken, refreshToken, "Bearer", expiresIn, userInfo);
    }
}
