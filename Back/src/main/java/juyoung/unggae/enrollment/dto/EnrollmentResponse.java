package juyoung.unggae.enrollment.dto;

import juyoung.unggae.enrollment.entity.Enrollment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class EnrollmentResponse {

    private final Long id;
    private final LocalDateTime enrolledAt;
    private final Long courseId;
    private final String courseTitle;
    private final String thumbnailUrl;
    private final String courseCategory;
    private final BigDecimal coursePrice;
    private final String instructorName;
    private final int progressPercent;

    private EnrollmentResponse(Enrollment enrollment) {
        this.id = enrollment.getId();
        this.enrolledAt = enrollment.getEnrolledAt();
        this.courseId = enrollment.getCourse().getId();
        this.courseTitle = enrollment.getCourse().getTitle();
        this.thumbnailUrl = enrollment.getCourse().getThumbnail();
        this.courseCategory = enrollment.getCourse().getCategory().name();
        this.coursePrice = enrollment.getCourse().getPrice();
        this.instructorName = enrollment.getCourse().getInstructor().getName();
        this.progressPercent = enrollment.getProgressPercent();
    }

    public static EnrollmentResponse from(Enrollment enrollment) {
        return new EnrollmentResponse(enrollment);
    }
}
