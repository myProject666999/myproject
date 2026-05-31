package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.CheckInRecord;

public interface CheckInRecordService extends IService<CheckInRecord> {
    Result<PageResult<CheckInRecord>> getRecordPage(int pageNum, int pageSize, String recordNo,
                                                     Long contractId, Long tenantId, Long apartmentId, String recordType);
    Result<CheckInRecord> getRecordDetail(Long id);
    Result<Void> createRecord(CheckInRecord record);
}
