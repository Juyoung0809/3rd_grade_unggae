package juyoung.unggae.user.dto;

import juyoung.unggae.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserProfileResponse {

    private Long id;
    private String email;
    private String nickname;
    private String bio;
    private String role;
    private String profileImageKey;
    private LocalDateTime createdAt;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .bio(user.getBio())
                .role(user.getRole().name())
                .profileImageKey(user.getProfileImageKey())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
