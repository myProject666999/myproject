package com.fmr.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fmr.entity.FamilyHistory;
import com.fmr.mapper.FamilyHistoryMapper;
import com.fmr.util.AesEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilyHistoryService extends ServiceImpl<FamilyHistoryMapper, FamilyHistory> {

    @Autowired
    private AesEncryptor aesEncryptor;

    public List<FamilyHistory> listByMemberId(Long memberId) {
        List<FamilyHistory> list = this.list(new LambdaQueryWrapper<FamilyHistory>()
                .eq(FamilyHistory::getMemberId, memberId));
        list.forEach(h -> {
            try {
                if (h.getRelativeName() != null) {
                    h.setRelativeName(aesEncryptor.decrypt(h.getRelativeName()));
                }
            } catch (Exception ignored) {
            }
        });
        return list;
    }

    public boolean saveHistory(FamilyHistory history) {
        if (history.getRelativeName() != null) {
            history.setRelativeName(aesEncryptor.encrypt(history.getRelativeName()));
        }
        return this.save(history);
    }
}
