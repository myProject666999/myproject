package com.example.incomeexpenditure.service;

import com.example.incomeexpenditure.entity.Record;
import com.example.incomeexpenditure.mapper.RecordMapper;
import com.example.incomeexpenditure.vo.DailyStatsVO;
import com.example.incomeexpenditure.vo.DayDetailVO;
import com.example.incomeexpenditure.vo.MonthStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class RecordService {

    @Autowired
    private RecordMapper recordMapper;

    public int addRecord(Record record) {
        return recordMapper.insert(record);
    }

    public int updateRecord(Record record) {
        return recordMapper.update(record);
    }

    public int deleteRecord(Long id) {
        return recordMapper.deleteById(id);
    }

    public Record getRecordById(Long id) {
        return recordMapper.findById(id);
    }

    public List<Record> getRecordsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return recordMapper.findByDateRange(userId, startDate, endDate);
    }

    public DayDetailVO getDayDetail(Long userId, LocalDate date) {
        List<Record> records = recordMapper.findByDate(userId, date);
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        for (Record r : records) {
            if (r.getType() == 1) {
                totalIncome = totalIncome.add(r.getAmount());
            } else {
                totalExpense = totalExpense.add(r.getAmount());
            }
        }
        DayDetailVO vo = new DayDetailVO();
        vo.setRecords(records);
        vo.setTotalIncome(totalIncome);
        vo.setTotalExpense(totalExpense);
        return vo;
    }

    public List<DailyStatsVO> getDailyStats(Long userId, LocalDate startDate, LocalDate endDate) {
        return recordMapper.getDailyStats(userId, startDate, endDate);
    }

    public MonthStatsVO getMonthStats(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = recordMapper.getTotalIncome(userId, startDate, endDate);
        BigDecimal totalExpense = recordMapper.getTotalExpense(userId, startDate, endDate);
        Integer incomeCount = recordMapper.getIncomeCount(userId, startDate, endDate);
        Integer expenseCount = recordMapper.getExpenseCount(userId, startDate, endDate);
        MonthStatsVO vo = new MonthStatsVO();
        vo.setTotalIncome(totalIncome != null ? totalIncome : BigDecimal.ZERO);
        vo.setTotalExpense(totalExpense != null ? totalExpense : BigDecimal.ZERO);
        vo.setBalance(vo.getTotalIncome().subtract(vo.getTotalExpense()));
        vo.setIncomeCount(incomeCount != null ? incomeCount : 0);
        vo.setExpenseCount(expenseCount != null ? expenseCount : 0);
        return vo;
    }

    public List<DailyStatsVO> getTopExpenseDays(Long userId, LocalDate startDate, LocalDate endDate, Integer limit) {
        return recordMapper.getTopExpenseDays(userId, startDate, endDate, limit);
    }
}
