package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.DoorLock;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.DoorLockMapper;
import com.smartdoor.service.DoorLockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DoorLockServiceImpl extends ServiceImpl<DoorLockMapper, DoorLock> implements DoorLockService {
    private static final Logger log = LoggerFactory.getLogger(DoorLockServiceImpl.class);

    @Override
    public Result<PageResult<DoorLock>> getLockPage(int pageNum, int pageSize, String lockNo, String apartmentId, String networkStatus, String lockStatus) {
        LambdaQueryWrapper<DoorLock> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(lockNo)) {
            wrapper.like(DoorLock::getLockNo, lockNo);
        }
        if (StringUtils.hasText(apartmentId)) {
            wrapper.eq(DoorLock::getApartmentId, apartmentId);
        }
        if (StringUtils.hasText(networkStatus)) {
            wrapper.eq(DoorLock::getNetworkStatus, networkStatus);
        }
        if (StringUtils.hasText(lockStatus)) {
            wrapper.eq(DoorLock::getLockStatus, lockStatus);
        }

        wrapper.orderByDesc(DoorLock::getCreateTime);

        Page<DoorLock> page = this.page(new Page<>(pageNum, pageSize), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(), pageNum, pageSize));
    }

    @Override
    public Result<DoorLock> getLockDetail(Long id) {
        DoorLock doorLock = this.getById(id);
        if (doorLock == null) {
            throw new BusinessException("门锁不存在");
        }
        return Result.success(doorLock);
    }

    @Override
    public Result<Void> addLock(DoorLock doorLock) {
        LambdaQueryWrapper<DoorLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DoorLock::getLockNo, doorLock.getLockNo());
        if (this.count(wrapper) > 0) {
            throw new BusinessException("门锁编号已存在");
        }

        if (doorLock.getStatus() == null) {
            doorLock.setStatus(1);
        }
        if (!StringUtils.hasText(doorLock.getNetworkStatus())) {
            doorLock.setNetworkStatus("ONLINE");
        }
        if (!StringUtils.hasText(doorLock.getLockStatus())) {
            doorLock.setLockStatus("NORMAL");
        }

        this.save(doorLock);
        log.info("新增门锁成功: {}", doorLock.getLockNo());
        return Result.success();
    }

    @Override
    public Result<Void> updateLock(DoorLock doorLock) {
        DoorLock exist = this.getById(doorLock.getId());
        if (exist == null) {
            throw new BusinessException("门锁不存在");
        }

        if (!exist.getLockNo().equals(doorLock.getLockNo())) {
            LambdaQueryWrapper<DoorLock> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(DoorLock::getLockNo, doorLock.getLockNo());
            if (this.count(wrapper) > 0) {
                throw new BusinessException("门锁编号已存在");
            }
        }

        this.updateById(doorLock);
        log.info("更新门锁成功: {}", doorLock.getLockNo());
        return Result.success();
    }

    @Override
    public Result<Void> deleteLock(Long id) {
        DoorLock doorLock = this.getById(id);
        if (doorLock == null) {
            throw new BusinessException("门锁不存在");
        }

        this.removeById(id);
        log.info("删除门锁成功: {}", doorLock.getLockNo());
        return Result.success();
    }

    @Override
    public Result<Void> updateLockStatus(Long id, String networkStatus, String lockStatus) {
        DoorLock doorLock = this.getById(id);
        if (doorLock == null) {
            throw new BusinessException("门锁不存在");
        }

        if (StringUtils.hasText(networkStatus)) {
            doorLock.setNetworkStatus(networkStatus);
        }
        if (StringUtils.hasText(lockStatus)) {
            doorLock.setLockStatus(lockStatus);
        }

        this.updateById(doorLock);
        log.info("更新门锁状态成功: {}", doorLock.getLockNo());
        return Result.success();
    }
}
