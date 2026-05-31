package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.dto.OperationLogQueryDTO;
import com.port.container.entity.OperationLog;

public interface OperationLogService extends IService<OperationLog> {

    void logOperation(String module, String operationType, Long businessId, String businessNo,
                     Object before, Object after, Long operatorId, String operatorName, String ip);

    IPage<OperationLog> queryLogs(OperationLogQueryDTO dto);
}
