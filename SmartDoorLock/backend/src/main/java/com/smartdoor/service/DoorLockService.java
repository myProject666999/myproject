package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.DoorLock;

public interface DoorLockService extends IService<DoorLock> {
    Result<PageResult<DoorLock>> getLockPage(int pageNum, int pageSize, String lockNo, String apartmentId, String networkStatus, String lockStatus);
    Result<DoorLock> getLockDetail(Long id);
    Result<Void> addLock(DoorLock doorLock);
    Result<Void> updateLock(DoorLock doorLock);
    Result<Void> deleteLock(Long id);
    Result<Void> updateLockStatus(Long id, String networkStatus, String lockStatus);
}
