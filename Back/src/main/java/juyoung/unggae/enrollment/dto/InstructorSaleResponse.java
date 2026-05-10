package juyoung.unggae.enrollment.dto;

import juyoung.unggae.enrollment.entity.Enrollment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class InstructorSaleResponse {
    private Long enrollmentId;
    private String studentNickname;
    private Long courseId;
    private String courseTitle;
    private BigDecimal paidPrice;
    private LocalDateTime enrolledAt;
    private String status;

    public static InstructorSaleResponse from(Enrollment e) {
        InstructorSaleResponse r = new InstructorSaleResponse();
        r.enrollmentId = e.getId();
        r.studentNickname = e.getUser().getNickname();
        r.courseId = e.getCourse().getId();
        r.courseTitle = e.getCourse().getTitle();
        r.paidPrice = e.getPaidPrice();
        r.enrolledAt = e.getEnrolledAt();
        r.status = e.getStatus().name();
        return r;
    }
}
