package com.logistics.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.logistics.entity.Waybill;
import com.logistics.service.WaybillService;
import com.logistics.vo.Result;
import com.logistics.vo.StatisticsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private WaybillService waybillService;

    @GetMapping("/summary")
    public Result<StatisticsVO> getStatistics() {
        StatisticsVO vo = new StatisticsVO();

        vo.setTotalWaybillCount(waybillService.count());
        vo.setPendingCount(waybillService.count(new LambdaQueryWrapper<Waybill>().eq(Waybill::getStatus, 0)));
        vo.setInTransitCount(waybillService.count(new LambdaQueryWrapper<Waybill>().eq(Waybill::getStatus, 1)));
        vo.setDeliveringCount(waybillService.count(new LambdaQueryWrapper<Waybill>().eq(Waybill::getStatus, 2)));
        vo.setDeliveredCount(waybillService.count(new LambdaQueryWrapper<Waybill>().eq(Waybill::getStatus, 3)));

        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        vo.setTodayNewCount(waybillService.count(new LambdaQueryWrapper<Waybill>()
                .ge(Waybill::getCreateTime, todayStart)
                .lt(Waybill::getCreateTime, todayEnd)));
        vo.setTodayDeliveredCount(waybillService.count(new LambdaQueryWrapper<Waybill>()
                .eq(Waybill::getStatus, 3)
                .ge(Waybill::getUpdateTime, todayStart)
                .lt(Waybill::getUpdateTime, todayEnd)));

        return Result.success(vo);
    }
}
