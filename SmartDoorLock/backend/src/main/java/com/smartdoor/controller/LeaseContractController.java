package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.LeaseContractCreateDTO;
import com.smartdoor.dto.LeaseContractQueryDTO;
import com.smartdoor.entity.LeaseContract;
import com.smartdoor.service.LeaseContractService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Api(tags = "租约管理")
@RestController
@RequestMapping("/lease-contract")
public class LeaseContractController {

    @Autowired
    private LeaseContractService leaseContractService;

    @ApiOperation("分页查询租约列表")
    @GetMapping("/page")
    public Result<PageResult<LeaseContract>> getContractPage(LeaseContractQueryDTO queryDTO) {
        return leaseContractService.getContractPage(queryDTO);
    }

    @ApiOperation("获取租约详情")
    @GetMapping("/{id}")
    public Result<LeaseContract> getContractDetail(@PathVariable Long id) {
        return leaseContractService.getContractDetail(id);
    }

    @ApiOperation("创建租约")
    @PostMapping
    public Result<Void> createContract(@RequestBody LeaseContractCreateDTO dto) {
        return leaseContractService.createContract(dto);
    }

    @ApiOperation("更新租约")
    @PutMapping
    public Result<Void> updateContract(@RequestBody LeaseContract contract) {
        return leaseContractService.updateContract(contract);
    }

    @ApiOperation("终止租约")
    @PutMapping("/{id}/terminate")
    public Result<Void> terminateContract(@PathVariable Long id, @RequestParam String reason) {
        return leaseContractService.terminateContract(id, reason);
    }

    @ApiOperation("确认入住")
    @PutMapping("/{id}/check-in")
    public Result<Void> checkIn(@PathVariable Long id, @RequestParam(required = false) LocalDate checkInDate) {
        return leaseContractService.checkIn(id, checkInDate);
    }
}
