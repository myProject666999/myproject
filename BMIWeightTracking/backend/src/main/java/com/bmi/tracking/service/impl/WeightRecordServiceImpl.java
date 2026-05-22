package com.bmi.tracking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bmi.tracking.common.BusinessException;
import com.bmi.tracking.common.UserContext;
import com.bmi.tracking.entity.User;
import com.bmi.tracking.entity.WeightRecord;
import com.bmi.tracking.mapper.UserMapper;
import com.bmi.tracking.mapper.WeightRecordMapper;
import com.bmi.tracking.service.WeightRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeightRecordServiceImpl implements WeightRecordService {

    @Autowired
    private WeightRecordMapper weightRecordMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public void addRecord(BigDecimal weight, LocalDate recordDate, String note) {
        Long userId = UserContext.getUserId();
        WeightRecord exist = weightRecordMapper.selectOne(
                new LambdaQueryWrapper<WeightRecord>()
                        .eq(WeightRecord::getUserId, userId)
                        .eq(WeightRecord::getRecordDate, recordDate)
        );
        if (exist != null) {
            exist.setWeight(weight);
            exist.setNote(note);
            weightRecordMapper.updateById(exist);
            return;
        }
        WeightRecord record = new WeightRecord();
        record.setUserId(userId);
        record.setWeight(weight);
        record.setRecordDate(recordDate);
        record.setNote(note);
        weightRecordMapper.insert(record);
    }

    @Override
    public void updateRecord(Long id, BigDecimal weight, String note) {
        Long userId = UserContext.getUserId();
        WeightRecord record = weightRecordMapper.selectById(id);
        if (record == null || !record.getUserId().equals(userId)) {
            throw new BusinessException("记录不存在");
        }
        record.setWeight(weight);
        record.setNote(note);
        weightRecordMapper.updateById(record);
    }

    @Override
    public void deleteRecord(Long id) {
        Long userId = UserContext.getUserId();
        WeightRecord record = weightRecordMapper.selectById(id);
        if (record == null || !record.getUserId().equals(userId)) {
            throw new BusinessException("记录不存在");
        }
        weightRecordMapper.deleteById(id);
    }

    @Override
    public List<WeightRecord> listRecords(LocalDate start, LocalDate end) {
        Long userId = UserContext.getUserId();
        LambdaQueryWrapper<WeightRecord> wrapper = new LambdaQueryWrapper<WeightRecord>()
                .eq(WeightRecord::getUserId, userId)
                .orderByDesc(WeightRecord::getRecordDate);
        if (start != null) {
            wrapper.ge(WeightRecord::getRecordDate, start);
        }
        if (end != null) {
            wrapper.le(WeightRecord::getRecordDate, end);
        }
        return weightRecordMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> getTrend(LocalDate start, LocalDate end, Integer maDays) {
        Long userId = UserContext.getUserId();
        User user = userMapper.selectById(userId);
        BigDecimal heightCm = user.getHeight();
        if (heightCm == null || heightCm.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("请先设置身高");
        }
        BigDecimal heightM = heightCm.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        if (start == null) {
            start = LocalDate.now().minusDays(30);
        }
        if (end == null) {
            end = LocalDate.now();
        }
        if (maDays == null || maDays <= 0) {
            maDays = 7;
        }

        LambdaQueryWrapper<WeightRecord> wrapper = new LambdaQueryWrapper<WeightRecord>()
                .eq(WeightRecord::getUserId, userId)
                .ge(WeightRecord::getRecordDate, start)
                .le(WeightRecord::getRecordDate, end)
                .orderByAsc(WeightRecord::getRecordDate);
        List<WeightRecord> records = weightRecordMapper.selectList(wrapper);

        List<String> dates = new ArrayList<>();
        List<BigDecimal> weights = new ArrayList<>();
        List<BigDecimal> bmis = new ArrayList<>();
        List<BigDecimal> ma = new ArrayList<>();

        for (int i = 0; i < records.size(); i++) {
            WeightRecord r = records.get(i);
            dates.add(r.getRecordDate().toString());
            weights.add(r.getWeight());
            BigDecimal bmi = r.getWeight().divide(heightM.multiply(heightM), 2, RoundingMode.HALF_UP);
            bmis.add(bmi);

            int from = Math.max(0, i - maDays + 1);
            int count = i - from + 1;
            BigDecimal sum = BigDecimal.ZERO;
            for (int j = from; j <= i; j++) {
                sum = sum.add(records.get(j).getWeight());
            }
            ma.add(sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("dates", dates);
        result.put("weights", weights);
        result.put("bmis", bmis);
        result.put("ma" + maDays, ma);
        result.put("maDays", maDays);

        BigDecimal latestWeight = weights.isEmpty() ? null : weights.get(weights.size() - 1);
        BigDecimal latestBmi = bmis.isEmpty() ? null : bmis.get(bmis.size() - 1);
        result.put("latestWeight", latestWeight);
        result.put("latestBmi", latestBmi);

        Map<String, Object> bmiRange = new HashMap<>();
        bmiRange.put("underweight", 18.5);
        bmiRange.put("normalHigh", 24.0);
        bmiRange.put("overweightHigh", 28.0);
        result.put("bmiRange", bmiRange);

        return result;
    }
}
