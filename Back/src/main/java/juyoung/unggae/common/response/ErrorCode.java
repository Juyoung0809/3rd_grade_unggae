package juyoung.unggae.common.response;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Auth
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "만료된 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_NOT_FOUND", "리프레시 토큰을 찾을 수 없습니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."),
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE", "비활성화된 계정입니다."),

    // Course
    COURSE_NOT_FOUND(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "강의를 찾을 수 없습니다."),
    COURSE_NOT_PUBLISHED(HttpStatus.BAD_REQUEST, "COURSE_NOT_PUBLISHED", "신청 가능한 강의가 아닙니다."),
    COURSE_FORBIDDEN(HttpStatus.FORBIDDEN, "COURSE_FORBIDDEN", "본인의 강의만 수정/삭제할 수 있습니다."),
    NOT_INSTRUCTOR(HttpStatus.FORBIDDEN, "NOT_INSTRUCTOR", "강사만 이용할 수 있는 기능입니다."),
    COURSE_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "COURSE_ALREADY_DELETED", "이미 삭제된 강의입니다."),

    // Enrollment
    ALREADY_ENROLLED(HttpStatus.CONFLICT, "ALREADY_ENROLLED", "이미 신청한 강의입니다."),
    NOT_ENROLLED(HttpStatus.FORBIDDEN, "NOT_ENROLLED", "수강 중인 강의가 아닙니다."),

    // Rating
    RATING_ALREADY_EXISTS(HttpStatus.CONFLICT, "RATING_ALREADY_EXISTS", "이미 평점을 등록했습니다."),
    RATING_NOT_FOUND(HttpStatus.NOT_FOUND, "RATING_NOT_FOUND", "평점을 찾을 수 없습니다."),
    RATING_FORBIDDEN(HttpStatus.FORBIDDEN, "RATING_FORBIDDEN", "본인의 평점만 수정할 수 있습니다."),

    // Question
    QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND", "질문을 찾을 수 없습니다."),
    QUESTION_FORBIDDEN(HttpStatus.FORBIDDEN, "QUESTION_FORBIDDEN", "본인의 질문만 수정할 수 있습니다."),
    QUESTION_WRITE_FORBIDDEN(HttpStatus.FORBIDDEN, "QUESTION_WRITE_FORBIDDEN", "수강생만 질문을 작성할 수 있습니다."),
    ANSWER_NOT_FOUND(HttpStatus.NOT_FOUND, "ANSWER_NOT_FOUND", "답변을 찾을 수 없습니다."),
    ANSWER_FORBIDDEN(HttpStatus.FORBIDDEN, "ANSWER_FORBIDDEN", "본인의 답변만 수정할 수 있습니다."),
    ANSWER_WRITE_FORBIDDEN(HttpStatus.FORBIDDEN, "ANSWER_WRITE_FORBIDDEN", "수강생 또는 강사만 답변을 작성할 수 있습니다."),

    // Common
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
