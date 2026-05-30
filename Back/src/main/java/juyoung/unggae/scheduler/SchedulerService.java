package juyoung.unggae.scheduler;

import juyoung.unggae.auth.repository.RefreshTokenRepository;
import juyoung.unggae.payment.entity.Payment;
import juyoung.unggae.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PaymentRepository paymentRepository;

    /** 매일 새벽 2시 - 만료된 RefreshToken 정리 */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanExpiredRefreshTokens() {
        int deleted = refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("[Scheduler] 만료된 RefreshToken 정리 완료: {}건 삭제", deleted);
    }

    /** 매일 오전 9시 - 전날 결제 통계 로그 출력 */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void dailyPaymentStatistics() {
        LocalDateTime from = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime to = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        List<Payment> payments = paymentRepository.findAllOrderByPaidAtDesc().stream()
                .filter(p -> p.getPaidAt() != null
                        && p.getPaidAt().isAfter(from)
                        && p.getPaidAt().isBefore(to)
                        && p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .toList();

        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getPaidPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("[Scheduler] 일별 결제 통계 - 날짜: {}, 결제수: {}건, 총매출: {}원",
                from.toLocalDate(), payments.size(), totalRevenue);
    }

    /** 매 시간 - 30분 이상 PENDING 상태인 결제를 FAILED 처리 */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireStalePendingPayments() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        List<Payment> stale = paymentRepository.findAllOrderByPaidAtDesc().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING
                        && p.getCreatedAt() != null
                        && p.getCreatedAt().isBefore(threshold))
                .toList();

        stale.forEach(Payment::fail);
        if (!stale.isEmpty()) {
            log.info("[Scheduler] 만료 PENDING 결제 처리: {}건", stale.size());
        }
    }
}
