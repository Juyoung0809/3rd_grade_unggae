package juyoung.unggae.course.entity;

import jakarta.persistence.*;
import juyoung.unggae.user.entity.User;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "lecture_count", nullable = false)
    @Builder.Default
    private int lectureCount = 1;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Category {
        YOUTUBE, SHORTS, MOTION, COLOR, THUMBNAIL
    }

    public enum Status {
        PENDING, PUBLISHED, REJECTED, DELETED
    }

    public void update(String title, String description, Category category,
                       java.math.BigDecimal price, String thumbnail, int lectureCount) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.thumbnail = thumbnail;
        this.lectureCount = lectureCount;
    }

    public void softDelete() {
        this.status = Status.DELETED;
    }
}
