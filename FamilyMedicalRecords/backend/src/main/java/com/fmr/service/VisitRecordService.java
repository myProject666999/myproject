package com.fmr.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fmr.entity.VisitRecord;
import com.fmr.entity.FollowupReminder;
import com.fmr.mapper.VisitRecordMapper;
import com.fmr.util.AesEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VisitRecordService extends ServiceImpl<VisitRecordMapper, VisitRecord> {

    @Autowired
    private AesEncryptor aesEncryptor;

    @Autowired
    private FollowupReminderService followupReminderService;

    public List<VisitRecord> listByMemberId(Long memberId) {
        return this.list(new LambdaQueryWrapper<VisitRecord>()
                .eq(VisitRecord::getMemberId, memberId)
                .orderByDesc(VisitRecord::getVisitDate));
    }

    public VisitRecord getVisitById(Long id) {
        VisitRecord v = this.getById(id);
        if (v != null) decryptVisit(v);
        return v;
    }

    @Transactional
    public boolean saveVisit(VisitRecord visit) {
        encryptVisit(visit);
        boolean ok = this.save(visit);
        if (ok && visit.getNextVisitDate() != null) {
            FollowupReminder reminder = new FollowupReminder();
            reminder.setVisitId(visit.getId());
            reminder.setMemberId(visit.getMemberId());
            reminder.setRemindDate(visit.getNextVisitDate());
            reminder.setContent("复诊提醒：" + visit.getHospital() + " " + visit.getDepartment());
            reminder.setStatus(0);
            followupReminderService.save(reminder);
        }
        return ok;
    }

    public boolean updateVisit(VisitRecord visit) {
        encryptVisit(visit);
        return this.updateById(visit);
    }

    public boolean removeVisit(Long id) {
        return this.removeById(id);
    }

    private void encryptVisit(VisitRecord v) {
        if (v.getDoctor() != null) v.setDoctor(aesEncryptor.encrypt(v.getDoctor()));
    }

    private void decryptVisit(VisitRecord v) {
        try {
            if (v.getDoctor() != null) v.setDoctor(aesEncryptor.decrypt(v.getDoctor()));
        } catch (Exception ignored) {
        }
    }
}
