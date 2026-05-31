package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.TenantQueryDTO;
import com.smartdoor.entity.Tenant;

public interface TenantService extends IService<Tenant> {
    Result<PageResult<Tenant>> getTenantPage(TenantQueryDTO queryDTO);
    Result<Tenant> getTenantDetail(Long id);
    Result<Void> addTenant(Tenant tenant);
    Result<Void> updateTenant(Tenant tenant);
    Result<Void> deleteTenant(Long id);
}
