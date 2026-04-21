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
        YOUTUBE,          // 유튜브 영상
        SHORTS,           // 쇼츠 영상
        POST_PRODUCTION,  // 영상 후반작업
        ADVERTISEMENT,    // 광고·홍보 영상
        AI,               // AI 영상
        EVENT,            // 행사 영상
        INDUSTRY,         // 업종별 영상
        MOTION,           // 모션그래픽
        MUSIC,            // 음악·음원
        SOUND,            // 기타 음향·음악
        COLOR,            // 색보정
        THUMBNAIL,        // 썸네일
        VLOG              // 브이로그
    }

    public enum Status {
        PENDING, PUBLISHED, REJECTED, DELETED
    }

    public void update(String title, String description, Category category,
                       java.math.BigDecimal price, String thumbnail) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.price = price;
        this.thumbnail = thumbnail;
    }

    public void updateLectureCount(int lectureCount) {
        this.lectureCount = lectureCount;
    }

    public void approve() {
        this.status = Status.PUBLISHED;
    }

    public void reject() {
        this.status = Status.REJECTED;
    }

    public void softDelete() {
        this.status = Status.DELETED;
    }
}
