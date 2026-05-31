package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.TenantQueryDTO;
import com.smartdoor.entity.Tenant;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.TenantMapper;
import com.smartdoor.service.TenantService;
import com.smartdoor.utils.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TenantServiceImpl extends ServiceImpl<TenantMapper, Tenant> implements TenantService {
    private static final Logger log = LoggerFactory.getLogger(TenantServiceImpl.class);

    @Override
    public Result<PageResult<Tenant>> getTenantPage(TenantQueryDTO queryDTO) {
        LambdaQueryWrapper<Tenant> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getTenantNo())) {
            wrapper.like(Tenant::getTenantNo, queryDTO.getTenantNo());
        }
        if (StringUtils.hasText(queryDTO.getName())) {
            wrapper.like(Tenant::getName, queryDTO.getName());
        }
        if (StringUtils.hasText(queryDTO.getPhone())) {
            wrapper.like(Tenant::getPhone, queryDTO.getPhone());
        }
        if (StringUtils.hasText(queryDTO.getIdCard())) {
            wrapper.like(Tenant::getIdCard, queryDTO.getIdCard());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            wrapper.eq(Tenant::getStatus, queryDTO.getStatus());
        }
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Tenant::getName, queryDTO.getKeyword())
                    .or().like(Tenant::getPhone, queryDTO.getKeyword())
                    .or().like(Tenant::getTenantNo, queryDTO.getKeyword()));
        }

        wrapper.orderByDesc(Tenant::getCreateTime);

        Page<Tenant> page = this.page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(),
                queryDTO.getPageNum(), queryDTO.getPageSize()));
    }

    @Override
    public Result<Tenant> getTenantDetail(Long id) {
        Tenant tenant = this.getById(id);
        if (tenant == null) {
            throw new BusinessException("租客不存在");
        }
        return Result.success(tenant);
    }

    @Override
    public Result<Void> addTenant(Tenant tenant) {
        LambdaQueryWrapper<Tenant> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Tenant::getPhone, tenant.getPhone());
        if (this.count(wrapper) > 0) {
            throw new BusinessException("手机号已存在");
        }

        if (!StringUtils.hasText(tenant.getTenantNo())) {
            tenant.setTenantNo("T" + System.currentTimeMillis());
        }
        if (!StringUtils.hasText(tenant.getStatus())) {
            tenant.setStatus("NORMAL");
        }

        this.save(tenant);
        log.info("新增租客成功: {}", tenant.getName());
        return Result.success();
    }

    @Override
    public Result<Void> updateTenant(Tenant tenant) {
        Tenant exist = this.getById(tenant.getId());
        if (exist == null) {
            throw new BusinessException("租客不存在");
        }

        if (!exist.getPhone().equals(tenant.getPhone())) {
            LambdaQueryWrapper<Tenant> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Tenant::getPhone, tenant.getPhone());
            if (this.count(wrapper) > 0) {
                throw new BusinessException("手机号已存在");
            }
        }

        this.updateById(tenant);
        log.info("更新租客成功: {}", tenant.getName());
        return Result.success();
    }

    @Override
    public Result<Void> deleteTenant(Long id) {
        Tenant tenant = this.getById(id);
        if (tenant == null) {
            throw new BusinessException("租客不存在");
        }

        this.removeById(id);
        log.info("删除租客成功: {}", tenant.getName());
        return Result.success();
    }
}
