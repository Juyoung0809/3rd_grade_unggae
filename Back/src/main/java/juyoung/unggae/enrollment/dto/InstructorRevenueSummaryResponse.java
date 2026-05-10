package juyoung.unggae.enrollment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class InstructorRevenueSummaryResponse {
    private BigDecimal totalRevenue;
    private BigDecimal thisMonthRevenue;
    private long totalSalesCount;
    private List<MonthlyStatResponse> monthlyStats;
}
