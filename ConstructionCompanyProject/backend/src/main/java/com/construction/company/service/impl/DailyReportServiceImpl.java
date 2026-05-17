package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.DailyReport;
import com.construction.company.mapper.DailyReportMapper;
import com.construction.company.service.DailyReportService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DailyReportServiceImpl extends ServiceImpl<DailyReportMapper, DailyReport> implements DailyReportService {

    @Override
    public boolean save(DailyReport dailyReport) {
        return super.save(dailyReport);
    }

    @Override
    public boolean updateById(DailyReport dailyReport) {
        return super.updateById(dailyReport);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public DailyReport getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<DailyReport> list() {
        return super.list();
    }
}
