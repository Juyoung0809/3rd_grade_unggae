package juyoung.unggae.payment.dto;

import juyoung.unggae.payment.entity.Payment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class PaymentHistoryResponse {

    private final Long paymentId;
    private final Long courseId;
    private final String courseTitle;
    private final String thumbnailUrl;
    private final String courseCategory;
    private final String instructorName;
    private final BigDecimal paidPrice;
    private final LocalDateTime paidAt;
    private final String method;
    private final String status;

    private PaymentHistoryResponse(Payment payment) {
        this.paymentId = payment.getId();
        this.courseId = payment.getCourse().getId();
        this.courseTitle = payment.getCourse().getTitle();
        this.thumbnailUrl = payment.getCourse().getThumbnail();
        this.courseCategory = payment.getCourse().getCategory().name();
        this.instructorName = payment.getCourse().getInstructor().getNickname();
        this.paidPrice = payment.getPaidPrice();
        this.paidAt = payment.getPaidAt();
        this.method = payment.getMethod().name();
        this.status = payment.getStatus().name();
    }

    public static PaymentHistoryResponse from(Payment payment) {
        return new PaymentHistoryResponse(payment);
    }
}
