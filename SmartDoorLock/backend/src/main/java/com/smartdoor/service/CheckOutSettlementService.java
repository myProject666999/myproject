package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.CheckOutSettlementDTO;
import com.smartdoor.entity.CheckOutSettlement;

public interface CheckOutSettlementService extends IService<CheckOutSettlement> {
    Result<PageResult<CheckOutSettlement>> getSettlementPage(int pageNum, int pageSize, String settlementNo,
                                                               Long contractId, Long tenantId, Long apartmentId, String status);
    Result<CheckOutSettlement> getSettlementDetail(Long id);
    Result<CheckOutSettlement> createSettlement(CheckOutSettlementDTO dto);
    Result<Void> confirmSettlement(Long id);
    Result<Void> executeRefund(Long id, String refundMethod, String refundTransactionNo);
}
