package com.fmr.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fmr.entity.FollowupReminder;
import com.fmr.mapper.FollowupReminderMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FollowupReminderService extends ServiceImpl<FollowupReminderMapper, FollowupReminder> {

    public List<FollowupReminder> listByMemberId(Long memberId) {
        return this.list(new LambdaQueryWrapper<FollowupReminder>()
                .eq(FollowupReminder::getMemberId, memberId)
                .orderByAsc(FollowupReminder::getRemindDate));
    }

    public List<FollowupReminder> listUpcoming(LocalDate from, LocalDate to) {
        return this.list(new LambdaQueryWrapper<FollowupReminder>()
                .between(FollowupReminder::getRemindDate, from, to)
                .eq(FollowupReminder::getStatus, 0)
                .orderByAsc(FollowupReminder::getRemindDate));
    }

    public boolean markStatus(Long id, Integer status) {
        FollowupReminder r = this.getById(id);
        if (r == null) return false;
        r.setStatus(status);
        return this.updateById(r);
    }
}
