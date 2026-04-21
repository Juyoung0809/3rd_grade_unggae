package juyoung.unggae.admin.dto;

import juyoung.unggae.user.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserListResponse {

    private final Long id;
    private final String email;
    private final String nickname;
    private final String role;
    private final String status;
    private final LocalDateTime createdAt;

    private UserListResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.role = user.getRole().name();
        this.status = user.getStatus().name();
        this.createdAt = user.getCreatedAt();
    }

    public static UserListResponse from(User user) {
        return new UserListResponse(user);
    }
}
