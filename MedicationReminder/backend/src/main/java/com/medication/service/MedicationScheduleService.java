package com.medication.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.medication.entity.MedicationSchedule;
import com.medication.vo.ScheduleVO;
import java.util.List;

public interface MedicationScheduleService extends IService<MedicationSchedule> {
    List<ScheduleVO> listByUserId(Long userId);
    List<ScheduleVO> listTodayByUserId(Long userId);
    List<ScheduleVO> listAll();
}
