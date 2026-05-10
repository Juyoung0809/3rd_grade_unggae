package juyoung.unggae.enrollment.service;

import juyoung.unggae.enrollment.dto.InstructorRevenueSummaryResponse;
import juyoung.unggae.enrollment.dto.InstructorSaleResponse;
import juyoung.unggae.enrollment.dto.MonthlyStatResponse;
import juyoung.unggae.enrollment.entity.Enrollment;
import juyoung.unggae.enrollment.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstructorRevenueService {

    private final EnrollmentRepository enrollmentRepository;

    public InstructorRevenueSummaryResponse getSummary(Long instructorId) {
        List<Enrollment> all = enrollmentRepository.findAllByInstructorId(instructorId);

        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        BigDecimal totalRevenue = all.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ACTIVE)
                .map(Enrollment::getPaidPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal thisMonthRevenue = all.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ACTIVE
                        && e.getEnrolledAt().getYear() == currentYear
                        && e.getEnrolledAt().getMonthValue() == currentMonth)
                .map(Enrollment::getPaidPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalSalesCount = all.size();

        Map<String, List<Enrollment>> byMonth = all.stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ACTIVE)
                .collect(Collectors.groupingBy(e ->
                        e.getEnrolledAt().getYear() + "-" + e.getEnrolledAt().getMonthValue()));

        List<MonthlyStatResponse> monthlyStats = byMonth.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    BigDecimal revenue = entry.getValue().stream()
                            .map(Enrollment::getPaidPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new MonthlyStatResponse(year, month, revenue, entry.getValue().size());
                })
                .sorted(Comparator.comparingInt(MonthlyStatResponse::getYear)
                        .thenComparingInt(MonthlyStatResponse::getMonth)
                        .reversed())
                .limit(12)
                .collect(Collectors.toList());

        return new InstructorRevenueSummaryResponse(totalRevenue, thisMonthRevenue, totalSalesCount, monthlyStats);
    }

    public List<InstructorSaleResponse> getSales(Long instructorId, Long courseId) {
        List<Enrollment> enrollments = (courseId != null)
                ? enrollmentRepository.findAllByInstructorIdAndCourseId(instructorId, courseId)
                : enrollmentRepository.findAllByInstructorId(instructorId);

        return enrollments.stream()
                .map(InstructorSaleResponse::from)
                .collect(Collectors.toList());
    }
}
