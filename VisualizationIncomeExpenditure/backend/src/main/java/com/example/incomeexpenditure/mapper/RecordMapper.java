package com.example.incomeexpenditure.mapper;

import com.example.incomeexpenditure.entity.Record;
import com.example.incomeexpenditure.vo.DailyStatsVO;
import org.apache.ibatis.annotations.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface RecordMapper {
    int insert(Record record);
    int update(Record record);
    int deleteById(@Param("id") Long id);
    Record findById(@Param("id") Long id);
    List<Record> findByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    List<Record> findByDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<DailyStatsVO> getDailyStats(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    BigDecimal getTotalIncome(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    BigDecimal getTotalExpense(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    Integer getIncomeCount(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    Integer getExpenseCount(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    List<DailyStatsVO> getTopExpenseDays(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("limit") Integer limit);
}
