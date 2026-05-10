package juyoung.unggae.enrollment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MonthlyStatResponse {
    private int year;
    private int month;
    private BigDecimal revenue;
    private long salesCount;
}
