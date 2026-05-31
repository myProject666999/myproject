package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.LeaseContractCreateDTO;
import com.smartdoor.dto.LeaseContractQueryDTO;
import com.smartdoor.entity.Apartment;
import com.smartdoor.entity.LeaseContract;
import com.smartdoor.entity.Tenant;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.LeaseContractMapper;
import com.smartdoor.service.ApartmentService;
import com.smartdoor.service.LeaseContractService;
import com.smartdoor.service.TenantService;
import com.smartdoor.utils.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class LeaseContractServiceImpl extends ServiceImpl<LeaseContractMapper, LeaseContract> implements LeaseContractService {
    private static final Logger log = LoggerFactory.getLogger(LeaseContractServiceImpl.class);

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private TenantService tenantService;

    @Override
    public Result<PageResult<LeaseContract>> getContractPage(LeaseContractQueryDTO queryDTO) {
        LambdaQueryWrapper<LeaseContract> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getContractNo())) {
            wrapper.like(LeaseContract::getContractNo, queryDTO.getContractNo());
        }
        if (queryDTO.getTenantId() != null) {
            wrapper.eq(LeaseContract::getTenantId, queryDTO.getTenantId());
        }
        if (StringUtils.hasText(queryDTO.getTenantName())) {
            wrapper.like(LeaseContract::getTenantName, queryDTO.getTenantName());
        }
        if (queryDTO.getApartmentId() != null) {
            wrapper.eq(LeaseContract::getApartmentId, queryDTO.getApartmentId());
        }
        if (StringUtils.hasText(queryDTO.getApartmentNo())) {
            wrapper.like(LeaseContract::getApartmentNo, queryDTO.getApartmentNo());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            wrapper.eq(LeaseContract::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(LeaseContract::getStartDate, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(LeaseContract::getEndDate, queryDTO.getEndDate());
        }
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(LeaseContract::getContractNo, queryDTO.getKeyword())
                    .or().like(LeaseContract::getTenantName, queryDTO.getKeyword())
                    .or().like(LeaseContract::getApartmentNo, queryDTO.getKeyword()));
        }

        wrapper.orderByDesc(LeaseContract::getCreateTime);

        Page<LeaseContract> page = this.page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(),
                queryDTO.getPageNum(), queryDTO.getPageSize()));
    }

    @Override
    public Result<LeaseContract> getContractDetail(Long id) {
        LeaseContract contract = this.getById(id);
        if (contract == null) {
            throw new BusinessException("租约不存在");
        }
        return Result.success(contract);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> createContract(LeaseContractCreateDTO dto) {
        Tenant tenant = tenantService.getById(dto.getTenantId());
        if (tenant == null) {
            throw new BusinessException("租客不存在");
        }

        Apartment apartment = apartmentService.getById(dto.getApartmentId());
        if (apartment == null) {
            throw new BusinessException("房源不存在");
        }

        if (!"VACANT".equals(apartment.getStatus())) {
            throw new BusinessException("该房源当前状态不可出租");
        }

        long leaseTerm = ChronoUnit.MONTHS.between(dto.getStartDate(), dto.getEndDate());
        if (leaseTerm <= 0) {
            throw new BusinessException("租期至少为1个月");
        }

        LeaseContract contract = new LeaseContract();
        contract.setContractNo(PasswordGenerator.generateContractNo());
        contract.setTenantId(dto.getTenantId());
        contract.setTenantName(tenant.getName());
        contract.setApartmentId(dto.getApartmentId());
        contract.setApartmentNo(apartment.getApartmentNo());
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setLeaseTerm((int) leaseTerm);
        contract.setMonthlyRent(dto.getMonthlyRent() != null ? dto.getMonthlyRent() : apartment.getMonthlyRent());
        contract.setDeposit(dto.getDeposit() != null ? dto.getDeposit() : apartment.getDeposit());
        contract.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "MONTHLY");
        contract.setPaymentDay(dto.getPaymentDay() != null ? dto.getPaymentDay() : 1);
        contract.setWaterPrice(dto.getWaterPrice() != null ? dto.getWaterPrice() : new java.math.BigDecimal("5.0"));
        contract.setElectricityPrice(dto.getElectricityPrice() != null ? dto.getElectricityPrice() : new java.math.BigDecimal("1.5"));
        contract.setStatus("PENDING");
        contract.setSigningDate(dto.getSigningDate() != null ? dto.getSigningDate() : LocalDate.now());
        contract.setRemark(dto.getRemark());

        this.save(contract);

        apartmentService.updateApartmentStatus(dto.getApartmentId(), "OCCUPIED");

        log.info("创建租约成功: {}, 租客: {}, 房源: {}", contract.getContractNo(), tenant.getName(), apartment.getApartmentNo());
        return Result.success();
    }

    @Override
    public Result<Void> updateContract(LeaseContract contract) {
        LeaseContract exist = this.getById(contract.getId());
        if (exist == null) {
            throw new BusinessException("租约不存在");
        }

        this.updateById(contract);
        log.info("更新租约成功: {}", contract.getContractNo());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> terminateContract(Long id, String reason) {
        LeaseContract contract = this.getById(id);
        if (contract == null) {
            throw new BusinessException("租约不存在");
        }

        if ("TERMINATED".equals(contract.getStatus()) || "EXPIRED".equals(contract.getStatus())) {
            throw new BusinessException("该租约已终止或已过期");
        }

        contract.setStatus("TERMINATED");
        contract.setCheckOutDate(LocalDate.now());
        contract.setRemark(contract.getRemark() + " 终止原因: " + reason);
        this.updateById(contract);

        apartmentService.updateApartmentStatus(contract.getApartmentId(), "VACANT");

        log.info("终止租约成功: {}, 原因: {}", contract.getContractNo(), reason);
        return Result.success();
    }

    @Override
    public Result<Void> checkIn(Long id, LocalDate checkInDate) {
        LeaseContract contract = this.getById(id);
        if (contract == null) {
            throw new BusinessException("租约不存在");
        }

        if ("ACTIVE".equals(contract.getStatus())) {
            throw new BusinessException("该租约已入住");
        }

        if (!"PENDING".equals(contract.getStatus())) {
            throw new BusinessException("该租约状态不可入住");
        }

        contract.setStatus("ACTIVE");
        contract.setCheckInDate(checkInDate != null ? checkInDate : LocalDate.now());
        this.updateById(contract);

        log.info("入住确认成功: {}", contract.getContractNo());
        return Result.success();
    }

    @Override
    public void checkContractExpire() {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<LeaseContract> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LeaseContract::getStatus, "ACTIVE")
                .lt(LeaseContract::getEndDate, today);

        this.list(wrapper).forEach(contract -> {
            contract.setStatus("EXPIRED");
            this.updateById(contract);

            apartmentService.updateApartmentStatus(contract.getApartmentId(), "VACANT");

            log.info("租约自动过期: contractNo={}, tenant={}",
                    contract.getContractNo(), contract.getTenantName());
        });
    }
}
