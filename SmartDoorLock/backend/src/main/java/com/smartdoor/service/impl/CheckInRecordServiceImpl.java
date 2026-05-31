package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.CheckInRecord;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.CheckInRecordMapper;
import com.smartdoor.service.CheckInRecordService;
import com.smartdoor.utils.PasswordGenerator;
import com.smartdoor.utils.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class CheckInRecordServiceImpl extends ServiceImpl<CheckInRecordMapper, CheckInRecord> implements CheckInRecordService {
    private static final Logger log = LoggerFactory.getLogger(CheckInRecordServiceImpl.class);

    @Override
    public Result<PageResult<CheckInRecord>> getRecordPage(int pageNum, int pageSize, String recordNo,
                                                             Long contractId, Long tenantId, Long apartmentId, String recordType) {
        LambdaQueryWrapper<CheckInRecord> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(recordNo)) {
            wrapper.like(CheckInRecord::getRecordNo, recordNo);
        }
        if (contractId != null) {
            wrapper.eq(CheckInRecord::getContractId, contractId);
        }
        if (tenantId != null) {
            wrapper.eq(CheckInRecord::getTenantId, tenantId);
        }
        if (apartmentId != null) {
            wrapper.eq(CheckInRecord::getApartmentId, apartmentId);
        }
        if (StringUtils.hasText(recordType)) {
            wrapper.eq(CheckInRecord::getRecordType, recordType);
        }

        wrapper.orderByDesc(CheckInRecord::getCreateTime);

        Page<CheckInRecord> page = this.page(new Page<>(pageNum, pageSize), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(), pageNum, pageSize));
    }

    @Override
    public Result<CheckInRecord> getRecordDetail(Long id) {
        CheckInRecord record = this.getById(id);
        if (record == null) {
            throw new BusinessException("记录不存在");
        }
        return Result.success(record);
    }

    @Override
    public Result<Void> createRecord(CheckInRecord record) {
        record.setRecordNo(PasswordGenerator.generateRecordNo());
        record.setRecordDate(record.getRecordDate() != null ? record.getRecordDate() : LocalDate.now());
        record.setRecordTime(record.getRecordTime() != null ? record.getRecordTime() : LocalDateTime.now());
        record.setOperatorId(UserContext.getUserId());
        record.setOperatorName(UserContext.getUsername());

        this.save(record);

        log.info("创建入住记录: recordNo={}, type={}, tenant={}",
                record.getRecordNo(), record.getRecordType(), record.getTenantName());
        return Result.success();
    }
}
