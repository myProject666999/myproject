package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.CheckOutSettlementDTO;
import com.smartdoor.entity.*;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.CheckOutSettlementMapper;
import com.smartdoor.service.*;
import com.smartdoor.utils.PasswordGenerator;
import com.smartdoor.utils.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class CheckOutSettlementServiceImpl extends ServiceImpl<CheckOutSettlementMapper, CheckOutSettlement> implements CheckOutSettlementService {
    private static final Logger log = LoggerFactory.getLogger(CheckOutSettlementServiceImpl.class);

    @Autowired
    private LeaseContractService leaseContractService;

    @Autowired
    private LockPasswordService lockPasswordService;

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private RentBillService rentBillService;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Result<PageResult<CheckOutSettlement>> getSettlementPage(int pageNum, int pageSize, String settlementNo,
                                                                      Long contractId, Long tenantId, Long apartmentId, String status) {
        LambdaQueryWrapper<CheckOutSettlement> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(settlementNo)) {
            wrapper.like(CheckOutSettlement::getSettlementNo, settlementNo);
        }
        if (contractId != null) {
            wrapper.eq(CheckOutSettlement::getContractId, contractId);
        }
        if (tenantId != null) {
            wrapper.eq(CheckOutSettlement::getTenantId, tenantId);
        }
        if (apartmentId != null) {
            wrapper.eq(CheckOutSettlement::getApartmentId, apartmentId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(CheckOutSettlement::getStatus, status);
        }

        wrapper.orderByDesc(CheckOutSettlement::getCreateTime);

        Page<CheckOutSettlement> page = this.page(new Page<>(pageNum, pageSize), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(), pageNum, pageSize));
    }

    @Override
    public Result<CheckOutSettlement> getSettlementDetail(Long id) {
        CheckOutSettlement settlement = this.getById(id);
        if (settlement == null) {
            throw new BusinessException("结算记录不存在");
        }
        return Result.success(settlement);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<CheckOutSettlement> createSettlement(CheckOutSettlementDTO dto) {
        LeaseContract contract = leaseContractService.getById(dto.getContractId());
        if (contract == null) {
            throw new BusinessException("租约不存在");
        }

        if ("EXPIRED".equals(contract.getStatus()) || "TERMINATED".equals(contract.getStatus())) {
            throw new BusinessException("该租约已过期或已终止");
        }

        LocalDate checkOutDate = dto.getCheckOutDate() != null ? dto.getCheckOutDate() : LocalDate.now();

        BigDecimal depositAmount = contract.getDeposit();

        BigDecimal totalDeduction = BigDecimal.ZERO;
        totalDeduction = totalDeduction.add(dto.getWaterSettlement() != null ? dto.getWaterSettlement() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(dto.getElectricitySettlement() != null ? dto.getElectricitySettlement() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(dto.getGasSettlement() != null ? dto.getGasSettlement() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(dto.getRepairFee() != null ? dto.getRepairFee() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(dto.getCleaningFee() != null ? dto.getCleaningFee() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(dto.getCompensationFee() != null ? dto.getCompensationFee() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(dto.getOtherDeduction() != null ? dto.getOtherDeduction() : BigDecimal.ZERO);

        BigDecimal totalRefund = BigDecimal.ZERO;
        totalRefund = totalRefund.add(dto.getOtherRefund() != null ? dto.getOtherRefund() : BigDecimal.ZERO);

        BigDecimal actualRefund = depositAmount.subtract(totalDeduction).add(totalRefund);

        CheckOutSettlement settlement = new CheckOutSettlement();
        settlement.setSettlementNo(PasswordGenerator.generateSettlementNo());
        settlement.setContractId(contract.getId());
        settlement.setContractNo(contract.getContractNo());
        settlement.setTenantId(contract.getTenantId());
        settlement.setTenantName(contract.getTenantName());
        settlement.setApartmentId(contract.getApartmentId());
        settlement.setApartmentNo(contract.getApartmentNo());
        settlement.setCheckOutDate(checkOutDate);
        settlement.setDepositAmount(depositAmount);
        settlement.setWaterSettlement(dto.getWaterSettlement() != null ? dto.getWaterSettlement() : BigDecimal.ZERO);
        settlement.setElectricitySettlement(dto.getElectricitySettlement() != null ? dto.getElectricitySettlement() : BigDecimal.ZERO);
        settlement.setGasSettlement(dto.getGasSettlement() != null ? dto.getGasSettlement() : BigDecimal.ZERO);
        settlement.setRepairFee(dto.getRepairFee() != null ? dto.getRepairFee() : BigDecimal.ZERO);
        settlement.setCleaningFee(dto.getCleaningFee() != null ? dto.getCleaningFee() : BigDecimal.ZERO);
        settlement.setCompensationFee(dto.getCompensationFee() != null ? dto.getCompensationFee() : BigDecimal.ZERO);
        settlement.setOtherDeduction(dto.getOtherDeduction() != null ? dto.getOtherDeduction() : BigDecimal.ZERO);
        settlement.setOtherRefund(dto.getOtherRefund() != null ? dto.getOtherRefund() : BigDecimal.ZERO);
        settlement.setTotalDeduction(totalDeduction);
        settlement.setTotalRefund(totalRefund);
        settlement.setActualRefund(actualRefund);
        settlement.setSettlementDetail(dto.getSettlementDetail());
        settlement.setStatus("PENDING");
        settlement.setOperatorId(UserContext.getUserId());
        settlement.setOperatorName(UserContext.getUsername());
        settlement.setRemark(dto.getRemark());

        this.save(settlement);

        contract.setStatus("TERMINATED");
        contract.setCheckOutDate(checkOutDate);
        leaseContractService.updateById(contract);

        LambdaQueryWrapper<LockPassword> passwordWrapper = new LambdaQueryWrapper<>();
        passwordWrapper.eq(LockPassword::getContractId, contract.getId())
                .eq(LockPassword::getStatus, "ACTIVE");
        lockPasswordService.list(passwordWrapper).forEach(p -> {
            p.setStatus("CANCELLED");
            lockPasswordService.updateById(p);
        });

        apartmentService.updateApartmentStatus(contract.getApartmentId(), "VACANT");

        notificationService.sendNotification(
                "TENANT",
                contract.getTenantId(),
                contract.getTenantName(),
                null,
                "EXPIRE_REMINDER",
                "退租结算通知",
                "您的退租结算已创建，应退金额：" + actualRefund + "元，请确认。",
                "SYSTEM",
                "SETTLEMENT",
                settlement.getId()
        );

        log.info("创建退租结算: settlementNo={}, tenant={}, refund={}",
                settlement.getSettlementNo(), contract.getTenantName(), actualRefund);

        return Result.success(settlement);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> confirmSettlement(Long id) {
        CheckOutSettlement settlement = this.getById(id);
        if (settlement == null) {
            throw new BusinessException("结算记录不存在");
        }

        if (!"PENDING".equals(settlement.getStatus())) {
            throw new BusinessException("只有待结算状态的记录才能确认");
        }

        settlement.setStatus("SETTLED");
        settlement.setSettlementDate(LocalDate.now());
        this.updateById(settlement);

        notificationService.sendNotification(
                "TENANT",
                settlement.getTenantId(),
                settlement.getTenantName(),
                null,
                "EXPIRE_REMINDER",
                "退租结算确认通知",
                "您的退租结算已确认，应退金额：" + settlement.getActualRefund() + "元，将尽快为您办理退款。",
                "SYSTEM",
                "SETTLEMENT",
                settlement.getId()
        );

        log.info("确认退租结算: settlementNo={}", settlement.getSettlementNo());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> executeRefund(Long id, String refundMethod, String refundTransactionNo) {
        CheckOutSettlement settlement = this.getById(id);
        if (settlement == null) {
            throw new BusinessException("结算记录不存在");
        }

        if (!"SETTLED".equals(settlement.getStatus())) {
            throw new BusinessException("只有已结算状态的记录才能退款");
        }

        if (settlement.getActualRefund().compareTo(BigDecimal.ZERO) > 0) {
            settlement.setRefundMethod(refundMethod);
            settlement.setRefundTransactionNo(refundTransactionNo);
            settlement.setRefundTime(LocalDateTime.now());
            settlement.setStatus("REFUNDED");

            this.updateById(settlement);

            notificationService.sendNotification(
                    "TENANT",
                    settlement.getTenantId(),
                    settlement.getTenantName(),
                    null,
                    "EXPIRE_REMINDER",
                    "退款完成通知",
                    "您的退租退款已完成，退款金额：" + settlement.getActualRefund() + "元，退款方式：" + refundMethod + "。",
                    "SYSTEM",
                    "SETTLEMENT",
                    settlement.getId()
            );

            log.info("执行退款成功: settlementNo={}, amount={}", settlement.getSettlementNo(), settlement.getActualRefund());
        } else {
            settlement.setStatus("REFUNDED");
            this.updateById(settlement);
            log.info("无退款，结算完成: settlementNo={}", settlement.getSettlementNo());
        }

        return Result.success();
    }
}
