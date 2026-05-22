package com.fmr.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fmr.entity.Allergy;
import com.fmr.mapper.AllergyMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AllergyService extends ServiceImpl<AllergyMapper, Allergy> {

    public List<Allergy> listByMemberId(Long memberId) {
        return this.list(new LambdaQueryWrapper<Allergy>()
                .eq(Allergy::getMemberId, memberId)
                .orderByDesc(Allergy::getFirstOccurAt));
    }
}
