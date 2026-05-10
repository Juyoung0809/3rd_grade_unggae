package juyoung.unggae.admin.dto;

import juyoung.unggae.payment.entity.Payment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class AdminPaymentResponse {

    private final Long paymentId;
    private final Long userId;
    private final String userNickname;
    private final String userEmail;
    private final Long courseId;
    private final String courseTitle;
    private final String instructorNickname;
    private final BigDecimal paidPrice;
    private final LocalDateTime paidAt;
    private final String method;
    private final String status;

    private AdminPaymentResponse(Payment payment) {
        this.paymentId = payment.getId();
        this.userId = payment.getUser().getId();
        this.userNickname = payment.getUser().getNickname();
        this.userEmail = payment.getUser().getEmail();
        this.courseId = payment.getCourse().getId();
        this.courseTitle = payment.getCourse().getTitle();
        this.instructorNickname = payment.getCourse().getInstructor().getNickname();
        this.paidPrice = payment.getPaidPrice();
        this.paidAt = payment.getPaidAt();
        this.method = payment.getMethod().name();
        this.status = payment.getStatus().name();
    }

    public static AdminPaymentResponse from(Payment payment) {
        return new AdminPaymentResponse(payment);
    }
}
