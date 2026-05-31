package com.port.container.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.dto.OperationLogQueryDTO;
import com.port.container.entity.OperationLog;
import com.port.container.mapper.OperationLogMapper;
import com.port.container.service.OperationLogService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OperationLogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLog> implements OperationLogService {

    @Override
    @Async
    public void logOperation(String module, String operationType, Long businessId, String businessNo,
                             Object before, Object after, Long operatorId, String operatorName, String ip) {
        try {
            OperationLog log = new OperationLog();
            log.setLogNo("LOG" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
            log.setModule(module);
            log.setOperationType(operationType);

            if (module != null) {
                switch (module) {
                    case "任务管理":
                        log.setTaskId(businessId);
                        log.setTaskNo(businessNo);
                        break;
                    case "集装箱管理":
                        log.setContainerId(businessId);
                        log.setContainerNo(businessNo);
                        break;
                    case "吊机管理":
                        log.setCraneId(businessId);
                        log.setCraneCode(businessNo);
                        break;
                    default:
                        break;
                }
            }

            if (before != null) {
                try {
                    log.setResult(JSON.toJSONString(before));
                } catch (Exception e) {
                    log.setResult(String.valueOf(before));
                }
            }
            if (after != null) {
                try {
                    log.setErrorMsg(JSON.toJSONString(after));
                } catch (Exception e) {
                    log.setErrorMsg(String.valueOf(after));
                }
            }

            log.setOperatorId(operatorId);
            log.setOperatorName(operatorName);
            log.setIpAddress(ip);
            log.setStartTime(LocalDateTime.now());
            log.setStatus(1);

            baseMapper.insert(log);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public IPage<OperationLog> queryLogs(OperationLogQueryDTO dto) {
        LambdaQueryWrapper<OperationLog> wrapper = new LambdaQueryWrapper<>();

        if (dto.getModule() != null) {
            wrapper.eq(OperationLog::getModule, dto.getModule());
        }
        if (dto.getOperationType() != null) {
            wrapper.eq(OperationLog::getOperationType, dto.getOperationType());
        }
        if (dto.getBusinessId() != null) {
            wrapper.and(w -> {
                w.eq(OperationLog::getTaskId, dto.getBusinessId());
                w.or().eq(OperationLog::getContainerId, dto.getBusinessId());
                w.or().eq(OperationLog::getCraneId, dto.getBusinessId());
            });
        }
        if (dto.getBusinessNo() != null) {
            wrapper.and(w -> {
                w.like(OperationLog::getTaskNo, dto.getBusinessNo());
                w.or().like(OperationLog::getContainerNo, dto.getBusinessNo());
                w.or().like(OperationLog::getCraneCode, dto.getBusinessNo());
            });
        }
        if (dto.getOperatorId() != null) {
            wrapper.eq(OperationLog::getOperatorId, dto.getOperatorId());
        }
        if (dto.getOperatorName() != null) {
            wrapper.like(OperationLog::getOperatorName, dto.getOperatorName());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(OperationLog::getStatus, dto.getStatus());
        }
        if (dto.getStartTime() != null) {
            wrapper.ge(OperationLog::getCreateTime, dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            wrapper.le(OperationLog::getCreateTime, dto.getEndTime());
        }

        wrapper.orderByDesc(OperationLog::getCreateTime);

        Long current = dto.getCurrent() != null ? dto.getCurrent() : 1L;
        Long size = dto.getSize() != null ? dto.getSize() : 10L;
        Page<OperationLog> page = new Page<>(current, size);

        return baseMapper.selectPage(page, wrapper);
    }
}
