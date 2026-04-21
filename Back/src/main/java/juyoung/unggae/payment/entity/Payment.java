package juyoung.unggae.payment.entity;

import jakarta.persistence.*;
import juyoung.unggae.course.entity.Course;
import juyoung.unggae.user.entity.User;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "paid_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal paidPrice;

    @Column(name = "paid_at", nullable = false)
    @Builder.Default
    private LocalDateTime paidAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.COMPLETED;

    public void cancel() {
        this.status = PaymentStatus.REFUNDED;
    }

    public enum PaymentMethod {
        FREE, CARD
    }

    public enum PaymentStatus {
        COMPLETED, REFUNDED
    }
}
