package juyoung.unggae.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AdminStatsResponse {

    private final long totalUsers;
    private final long totalStudents;
    private final long totalInstructors;

    private final long totalCourses;
    private final long publishedCourses;
    private final long pendingCourses;

    private final long totalEnrollments;

    private final long totalPayments;
    private final BigDecimal totalRevenue;
}
