package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.LeaseContractCreateDTO;
import com.smartdoor.dto.LeaseContractQueryDTO;
import com.smartdoor.entity.LeaseContract;

import java.time.LocalDate;

public interface LeaseContractService extends IService<LeaseContract> {
    Result<PageResult<LeaseContract>> getContractPage(LeaseContractQueryDTO queryDTO);
    Result<LeaseContract> getContractDetail(Long id);
    Result<Void> createContract(LeaseContractCreateDTO dto);
    Result<Void> updateContract(LeaseContract contract);
    Result<Void> terminateContract(Long id, String reason);
    Result<Void> checkIn(Long id, LocalDate checkInDate);
    void checkContractExpire();
}
