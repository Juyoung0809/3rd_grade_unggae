package juyoung.unggae.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import juyoung.unggae.admin.dto.UserListResponse;
import juyoung.unggae.admin.dto.UserRoleUpdateRequest;
import juyoung.unggae.admin.dto.UserStatusUpdateRequest;
import juyoung.unggae.admin.service.AdminUserService;
import juyoung.unggae.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin - User", description = "관리자 회원 관리")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(summary = "전체 회원 목록 조회", description = "모든 회원의 목록을 반환합니다. [ADMIN 전용]")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserListResponse>>> getAllUsers() {
        List<UserListResponse> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("회원 목록 조회 성공", users));
    }

    @Operation(summary = "회원 상태 변경", description = "회원을 활성화/비활성화합니다. [ADMIN 전용]")
    @PutMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserListResponse>> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        UserListResponse updated = adminUserService.updateUserStatus(userId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("회원 상태가 변경되었습니다.", updated));
    }

    @Operation(summary = "회원 역할 변경", description = "회원의 역할을 변경합니다. [ADMIN 전용]")
    @PutMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<UserListResponse>> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UserRoleUpdateRequest request) {
        UserListResponse updated = adminUserService.updateUserRole(userId, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("회원 역할이 변경되었습니다.", updated));
    }
}
