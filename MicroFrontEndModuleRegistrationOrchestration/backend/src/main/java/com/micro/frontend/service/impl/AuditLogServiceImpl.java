package com.micro.frontend.service.impl;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.AuditLog;
import com.micro.frontend.mapper.AuditLogMapper;
import com.micro.frontend.service.IAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class AuditLogServiceImpl implements IAuditLogService {

    @Autowired
    private AuditLogMapper auditLogMapper;

    @Override
    public AuditLog getById(Long id) {
        return auditLogMapper.selectById(id);
    }

    @Override
    public PageResult<AuditLog> page(PageQueryDTO query) {
        List<AuditLog> list = auditLogMapper.selectList(query);
        Long total = auditLogMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    public List<AuditLog> list(PageQueryDTO query) {
        return auditLogMapper.selectList(query);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean record(AuditLog auditLog) {
        if (auditLog.getAuditNo() == null) {
            auditLog.setAuditNo(generateAuditNo());
        }
        if (auditLog.getCreatedAt() == null) {
            auditLog.setCreatedAt(LocalDateTime.now());
        }
        return auditLogMapper.insert(auditLog) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean record(String operationType, String module, String targetTable,
                          Long targetId, String targetKey, String operator, String operatorIp,
                          String oldValue, String newValue, String changeSummary) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAuditNo(generateAuditNo());
        auditLog.setOperationType(operationType);
        auditLog.setModule(module);
        auditLog.setTargetTable(targetTable);
        auditLog.setTargetId(targetId);
        auditLog.setTargetKey(targetKey);
        auditLog.setOperator(operator);
        auditLog.setOperatorIp(operatorIp);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setChangeSummary(changeSummary);
        auditLog.setCreatedAt(LocalDateTime.now());
        return auditLogMapper.insert(auditLog) > 0;
    }

    @Override
    public List<AuditLog> getByTarget(String targetTable, Long targetId) {
        return auditLogMapper.selectByTarget(targetTable, targetId);
    }

    private String generateAuditNo() {
        return "AUD" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
}
