package juyoung.unggae.enrollment.entity;

import jakarta.persistence.*;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.user.entity.User;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "enrolled_at", nullable = false)
    @Builder.Default
    private LocalDateTime enrolledAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "paid_price", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal paidPrice = BigDecimal.ZERO;

    @Column(name = "completed_lecture_count", nullable = false)
    @Builder.Default
    private int completedLectureCount = 0;

    @Column(name = "progress_percent", nullable = false)
    @Builder.Default
    private int progressPercent = 0;

    public void completeLecture() {
        int total = this.course.getLectureCount();
        if (total <= 0) return;
        this.completedLectureCount = Math.min(this.completedLectureCount + 1, total);
        this.progressPercent = Math.round(this.completedLectureCount * 100.0f / total);
    }

    public enum Status {
        ACTIVE, CANCELLED
    }
}
