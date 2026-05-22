package com.bmi.tracking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bmi.tracking.common.UserContext;
import com.bmi.tracking.entity.Reminder;
import com.bmi.tracking.mapper.ReminderMapper;
import com.bmi.tracking.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class ReminderServiceImpl implements ReminderService {

    @Autowired
    private ReminderMapper reminderMapper;

    @Override
    public Reminder setReminder(LocalTime reminderTime, Integer enabled) {
        Long userId = UserContext.getUserId();
        Reminder exist = reminderMapper.selectOne(
                new LambdaQueryWrapper<Reminder>().eq(Reminder::getUserId, userId)
        );
        if (exist == null) {
            Reminder r = new Reminder();
            r.setUserId(userId);
            r.setReminderTime(reminderTime);
            r.setEnabled(enabled == null ? 1 : enabled);
            reminderMapper.insert(r);
            return r;
        }
        if (reminderTime != null) exist.setReminderTime(reminderTime);
        if (enabled != null) exist.setEnabled(enabled);
        reminderMapper.updateById(exist);
        return exist;
    }

    @Override
    public Reminder getReminder() {
        Long userId = UserContext.getUserId();
        return reminderMapper.selectOne(
                new LambdaQueryWrapper<Reminder>().eq(Reminder::getUserId, userId)
        );
    }

    @Override
    public void toggleEnabled(Integer enabled) {
        Long userId = UserContext.getUserId();
        Reminder r = reminderMapper.selectOne(
                new LambdaQueryWrapper<Reminder>().eq(Reminder::getUserId, userId)
        );
        if (r != null) {
            r.setEnabled(enabled);
            reminderMapper.updateById(r);
        }
    }

    @Override
    public List<Reminder> listDueReminders(LocalTime time) {
        return reminderMapper.selectList(
                new LambdaQueryWrapper<Reminder>()
                        .eq(Reminder::getReminderTime, time)
                        .eq(Reminder::getEnabled, 1)
        );
    }
}
