package juyoung.unggae.enrollment.dto;

import juyoung.unggae.enrollment.entity.Enrollment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class PaymentResponse {

    private final Long enrollmentId;
    private final Long courseId;
    private final String courseTitle;
    private final String thumbnailUrl;
    private final String courseCategory;
    private final String instructorName;
    private final BigDecimal paidPrice;
    private final LocalDateTime paidAt;

    private PaymentResponse(Enrollment enrollment) {
        this.enrollmentId = enrollment.getId();
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.thumbnailUrl = enrollment.getCourse().getThumbnail();
        this.courseCategory = enrollment.getCourse().getCategory().name();
        this.instructorName = enrollment.getCourse().getInstructor().getName();
        this.paidPrice = enrollment.getPaidPrice();
        this.paidAt = enrollment.getEnrolledAt();
    }

    public static PaymentResponse from(Enrollment enrollment) {
        return new PaymentResponse(enrollment);
    }
}
