package com.gym.membership.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.common.PageResult;
import com.gym.membership.dto.GateAccessDTO;
import com.gym.membership.entity.GateRecord;
import com.gym.membership.entity.MembershipCard;
import com.gym.membership.exception.BusinessException;
import com.gym.membership.mapper.GateRecordMapper;
import com.gym.membership.mapper.MembershipCardMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GateAccessService extends ServiceImpl<GateRecordMapper, GateRecord> {

    private final MembershipCardMapper cardMapper;

    public GateAccessService(MembershipCardMapper cardMapper) {
        this.cardMapper = cardMapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public GateRecord handleAccess(GateAccessDTO dto) {
        MembershipCard card = cardMapper.selectOne(new LambdaQueryWrapper<MembershipCard>()
                .eq(MembershipCard::getCardNo, dto.getCardNo()));

        if (card == null) {
            throw new BusinessException("会员卡不存在");
        }

        if (card.getStatus() != 1) {
            throw new BusinessException("会员卡状态异常");
        }

        if (card.getEndDate() != null && card.getEndDate().isBefore(LocalDate.now())) {
            throw new BusinessException("会员卡已过期");
        }

        if (card.getRemainingTimes() != null && card.getRemainingTimes() <= 0) {
            throw new BusinessException("次卡次数已用完");
        }

        if ("in".equals(dto.getAction())) {
            return handleIn(card, dto.getGateNo());
        } else if ("out".equals(dto.getAction())) {
            return handleOut(card, dto.getGateNo());
        } else {
            throw new BusinessException("操作类型无效");
        }
    }

    private GateRecord handleIn(MembershipCard card, String gateNo) {
        GateRecord existingRecord = this.getOne(new LambdaQueryWrapper<GateRecord>()
                .eq(GateRecord::getUserId, card.getUserId())
                .eq(GateRecord::getStatus, 1));

        if (existingRecord != null) {
            existingRecord.setOutTime(LocalDateTime.now());
            existingRecord.setStatus(2);
            this.updateById(existingRecord);
        }

        GateRecord record = new GateRecord();
        record.setUserId(card.getUserId());
        record.setCardId(card.getId());
        record.setGateNo(gateNo);
        record.setInTime(LocalDateTime.now());
        record.setStatus(1);
        this.save(record);

        if (card.getRemainingTimes() != null && card.getRemainingTimes() > 0) {
            card.setRemainingTimes(card.getRemainingTimes() - 1);
            cardMapper.updateById(card);
        }

        return record;
    }

    private GateRecord handleOut(MembershipCard card, String gateNo) {
        GateRecord record = this.getOne(new LambdaQueryWrapper<GateRecord>()
                .eq(GateRecord::getUserId, card.getUserId())
                .eq(GateRecord::getStatus, 1)
                .orderByDesc(GateRecord::getInTime)
                .last("LIMIT 1"));

        if (record == null) {
            throw new BusinessException("未找到入场记录");
        }

        record.setOutTime(LocalDateTime.now());
        record.setStatus(2);
        this.updateById(record);

        return record;
    }

    public PageResult<GateRecord> getRecordPage(Long pageNum, Long pageSize,
                                                 Long userId, String gateNo,
                                                 LocalDate startDate, LocalDate endDate) {
        Page<GateRecord> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<GateRecord> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(GateRecord::getUserId, userId);
        }
        if (gateNo != null) {
            wrapper.eq(GateRecord::getGateNo, gateNo);
        }
        if (startDate != null) {
            wrapper.ge(GateRecord::getInTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(GateRecord::getInTime, endDate.atTime(23, 59, 59));
        }
        wrapper.orderByDesc(GateRecord::getInTime);

        IPage<GateRecord> recordPage = this.page(page, wrapper);

        PageResult<GateRecord> result = new PageResult<>();
        result.setTotal(recordPage.getTotal());
        result.setPages(recordPage.getPages());
        result.setCurrent(recordPage.getCurrent());
        result.setSize(recordPage.getSize());
        result.setRecords(recordPage.getRecords());

        return result;
    }
}
