package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.AuditLog;

import java.util.List;

public interface IAuditLogService {

    AuditLog getById(Long id);

    PageResult<AuditLog> page(PageQueryDTO query);

    List<AuditLog> list(PageQueryDTO query);

    boolean record(AuditLog auditLog);

    boolean record(String operationType, String module, String targetTable,
                   Long targetId, String targetKey, String operator, String operatorIp,
                   String oldValue, String newValue, String changeSummary);

    List<AuditLog> getByTarget(String targetTable, Long targetId);
}
