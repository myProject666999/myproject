package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.PaymentDTO;
import com.smartdoor.dto.RentBillQueryDTO;
import com.smartdoor.entity.LeaseContract;
import com.smartdoor.entity.Notification;
import com.smartdoor.entity.RentBill;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.RentBillMapper;
import com.smartdoor.service.LeaseContractService;
import com.smartdoor.service.NotificationService;
import com.smartdoor.service.RentBillService;
import com.smartdoor.utils.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RentBillServiceImpl extends ServiceImpl<RentBillMapper, RentBill> implements RentBillService {
    private static final Logger log = LoggerFactory.getLogger(RentBillServiceImpl.class);

    @Autowired
    private LeaseContractService leaseContractService;

    @Autowired
    private NotificationService notificationService;

    @Override
    public Result<PageResult<RentBill>> getBillPage(RentBillQueryDTO queryDTO) {
        LambdaQueryWrapper<RentBill> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getBillNo())) {
            wrapper.like(RentBill::getBillNo, queryDTO.getBillNo());
        }
        if (queryDTO.getContractId() != null) {
            wrapper.eq(RentBill::getContractId, queryDTO.getContractId());
        }
        if (StringUtils.hasText(queryDTO.getContractNo())) {
            wrapper.like(RentBill::getContractNo, queryDTO.getContractNo());
        }
        if (queryDTO.getTenantId() != null) {
            wrapper.eq(RentBill::getTenantId, queryDTO.getTenantId());
        }
        if (StringUtils.hasText(queryDTO.getTenantName())) {
            wrapper.like(RentBill::getTenantName, queryDTO.getTenantName());
        }
        if (queryDTO.getApartmentId() != null) {
            wrapper.eq(RentBill::getApartmentId, queryDTO.getApartmentId());
        }
        if (StringUtils.hasText(queryDTO.getApartmentNo())) {
            wrapper.like(RentBill::getApartmentNo, queryDTO.getApartmentNo());
        }
        if (StringUtils.hasText(queryDTO.getBillMonth())) {
            wrapper.eq(RentBill::getBillMonth, queryDTO.getBillMonth());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            wrapper.eq(RentBill::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getDueDateStart() != null) {
            wrapper.ge(RentBill::getDueDate, queryDTO.getDueDateStart());
        }
        if (queryDTO.getDueDateEnd() != null) {
            wrapper.le(RentBill::getDueDate, queryDTO.getDueDateEnd());
        }
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(RentBill::getBillNo, queryDTO.getKeyword())
                    .or().like(RentBill::getTenantName, queryDTO.getKeyword())
                    .or().like(RentBill::getApartmentNo, queryDTO.getKeyword()));
        }

        wrapper.orderByDesc(RentBill::getCreateTime);

        Page<RentBill> page = this.page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(),
                queryDTO.getPageNum(), queryDTO.getPageSize()));
    }

    @Override
    public Result<RentBill> getBillDetail(Long id) {
        RentBill bill = this.getById(id);
        if (bill == null) {
            throw new BusinessException("账单不存在");
        }
        return Result.success(bill);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> payBill(PaymentDTO dto) {
        RentBill bill = this.getById(dto.getBillId());
        if (bill == null) {
            throw new BusinessException("账单不存在");
        }

        if ("PAID".equals(bill.getStatus())) {
            throw new BusinessException("该账单已缴费");
        }

        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("缴费金额必须大于0");
        }

        BigDecimal newPaidAmount = bill.getPaidAmount().add(dto.getAmount());
        int compareResult = newPaidAmount.compareTo(bill.getTotalAmount());

        bill.setPaidAmount(newPaidAmount);
        bill.setUnpaidAmount(bill.getTotalAmount().subtract(newPaidAmount));
        bill.setPaymentMethod(dto.getPaymentMethod());
        bill.setPaymentTransactionNo(dto.getPaymentTransactionNo());

        if (compareResult >= 0) {
            bill.setStatus("PAID");
            bill.setPaymentTime(LocalDateTime.now());
            log.info("账单已缴清: billNo={}, amount={}", bill.getBillNo(), dto.getAmount());

            notificationService.sendNotification(
                    "TENANT",
                    bill.getTenantId(),
                    bill.getTenantName(),
                    null,
                    "PAYMENT_SUCCESS",
                    "缴费成功通知",
                    "您" + bill.getBillMonth() + "月份的房租账单已缴清，金额：" + bill.getTotalAmount() + "元。",
                    "SYSTEM",
                    "BILL",
                    bill.getId()
            );
        } else {
            bill.setStatus("PARTIAL");
            log.info("账单部分缴费: billNo={}, amount={}", bill.getBillNo(), dto.getAmount());
        }

        this.updateById(bill);
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> generateMonthlyBills() {
        String billMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        log.info("开始生成 {} 月份的租金账单", billMonth);

        List<LeaseContract> activeContracts = leaseContractService.list(
                new LambdaQueryWrapper<LeaseContract>()
                        .eq(LeaseContract::getStatus, "ACTIVE")
        );

        int successCount = 0;
        int failCount = 0;

        for (LeaseContract contract : activeContracts) {
            try {
                generateBillForContract(contract.getId(), billMonth);
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("生成账单失败: contractId={}, error={}", contract.getId(), e.getMessage());
            }
        }

        log.info("月度账单生成完成: 成功{}条, 失败{}条", successCount, failCount);
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> generateBillForContract(Long contractId, String billMonth) {
        LeaseContract contract = leaseContractService.getById(contractId);
        if (contract == null) {
            throw new BusinessException("租约不存在");
        }

        if (!"ACTIVE".equals(contract.getStatus())) {
            throw new BusinessException("只有执行中的租约才能生成账单");
        }

        LocalDate monthDate = LocalDate.parse(billMonth + "-01");
        LocalDate billStartDate = monthDate;
        LocalDate billEndDate = monthDate.plusMonths(1).minusDays(1);

        if (contract.getStartDate().isAfter(billEndDate) || contract.getEndDate().isBefore(billStartDate)) {
            throw new BusinessException("该月份不在租约期内");
        }

        LambdaQueryWrapper<RentBill> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(RentBill::getContractId, contractId)
                .eq(RentBill::getBillMonth, billMonth);
        if (this.count(existWrapper) > 0) {
            throw new BusinessException("该租约" + billMonth + "月份的账单已存在");
        }

        LocalDate effectiveStart = billStartDate.isBefore(contract.getStartDate()) ? contract.getStartDate() : billStartDate;
        LocalDate effectiveEnd = billEndDate.isAfter(contract.getEndDate()) ? contract.getEndDate() : billEndDate;

        long totalDays = billEndDate.toEpochDay() - billStartDate.toEpochDay() + 1;
        long actualDays = effectiveEnd.toEpochDay() - effectiveStart.toEpochDay() + 1;
        BigDecimal dailyRent = contract.getMonthlyRent().divide(BigDecimal.valueOf(totalDays), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal rentAmount = dailyRent.multiply(BigDecimal.valueOf(actualDays));

        LocalDate dueDate = billStartDate.withDayOfMonth(contract.getPaymentDay() != null ? contract.getPaymentDay() : 1);

        RentBill bill = new RentBill();
        bill.setBillNo(PasswordGenerator.generateBillNo());
        bill.setContractId(contract.getId());
        bill.setContractNo(contract.getContractNo());
        bill.setTenantId(contract.getTenantId());
        bill.setTenantName(contract.getTenantName());
        bill.setApartmentId(contract.getApartmentId());
        bill.setApartmentNo(contract.getApartmentNo());
        bill.setBillMonth(billMonth);
        bill.setBillStartDate(effectiveStart);
        bill.setBillEndDate(effectiveEnd);
        bill.setRentAmount(rentAmount);
        bill.setWaterFee(BigDecimal.ZERO);
        bill.setElectricityFee(BigDecimal.ZERO);
        bill.setGasFee(BigDecimal.ZERO);
        bill.setPropertyFee(BigDecimal.ZERO);
        bill.setNetworkFee(BigDecimal.ZERO);
        bill.setOtherFee(BigDecimal.ZERO);
        bill.setLateFee(BigDecimal.ZERO);
        bill.setTotalAmount(rentAmount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setUnpaidAmount(rentAmount);
        bill.setDueDate(dueDate);
        bill.setStatus("UNPAID");
        bill.setReminderCount(0);

        this.save(bill);

        log.info("生成账单成功: billNo={}, tenant={}, amount={}",
                bill.getBillNo(), contract.getTenantName(), rentAmount);

        return Result.success();
    }

    @Override
    public Result<Void> sendPaymentReminder(Long billId) {
        RentBill bill = this.getById(billId);
        if (bill == null) {
            throw new BusinessException("账单不存在");
        }

        if ("PAID".equals(bill.getStatus())) {
            throw new BusinessException("该账单已缴费，无需提醒");
        }

        notificationService.sendNotification(
                "TENANT",
                bill.getTenantId(),
                bill.getTenantName(),
                null,
                "PAYMENT_REMINDER",
                "缴费提醒",
                "您" + bill.getBillMonth() + "月份的房租账单待缴，金额：" + bill.getUnpaidAmount() + "元，缴费截止日期：" + bill.getDueDate() + "，请及时缴费。",
                "SYSTEM",
                "BILL",
                bill.getId()
        );

        bill.setReminderCount(bill.getReminderCount() + 1);
        bill.setLastReminderTime(LocalDateTime.now());
        this.updateById(bill);

        log.info("发送缴费提醒: billNo={}, tenant={}", bill.getBillNo(), bill.getTenantName());
        return Result.success();
    }

    @Override
    public void checkBillOverdue() {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<RentBill> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(RentBill::getStatus, "UNPAID", "PARTIAL")
                .lt(RentBill::getDueDate, today);

        this.list(wrapper).forEach(bill -> {
            if (!"OVERDUE".equals(bill.getStatus())) {
                bill.setStatus("OVERDUE");

                long overdueDays = today.toEpochDay() - bill.getDueDate().toEpochDay();
                BigDecimal lateFee = bill.getUnpaidAmount().multiply(BigDecimal.valueOf(0.001)).multiply(BigDecimal.valueOf(overdueDays));
                bill.setLateFee(bill.getLateFee().add(lateFee));
                bill.setTotalAmount(bill.getTotalAmount().add(lateFee));
                bill.setUnpaidAmount(bill.getUnpaidAmount().add(lateFee));

                this.updateById(bill);

                notificationService.sendNotification(
                        "TENANT",
                        bill.getTenantId(),
                        bill.getTenantName(),
                        null,
                        "OVERDUE_REMINDER",
                        "账单逾期提醒",
                        "您" + bill.getBillMonth() + "月份的房租账单已逾期" + overdueDays + "天，产生滞纳金：" + lateFee + "元，请尽快缴费。",
                        "SYSTEM",
                        "BILL",
                        bill.getId()
                );

                log.info("账单已逾期: billNo={}, overdueDays={}, lateFee={}",
                        bill.getBillNo(), overdueDays, lateFee);
            }
        });
    }

    @Override
    public void sendPaymentReminders() {
        LocalDate today = LocalDate.now();
        LocalDate dueDateThreshold = today.plusDays(3);

        LambdaQueryWrapper<RentBill> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(RentBill::getStatus, "UNPAID", "PARTIAL")
                .le(RentBill::getDueDate, dueDateThreshold)
                .ge(RentBill::getDueDate, today);

        this.list(wrapper).forEach(bill -> {
            if (bill.getReminderCount() < 2) {
                try {
                    sendPaymentReminder(bill.getId());
                } catch (Exception e) {
                    log.error("发送缴费提醒失败: billId={}", bill.getId(), e);
                }
            }
        });
    }
}
