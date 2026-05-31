package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.LockPasswordQueryDTO;
import com.smartdoor.dto.SendPasswordDTO;
import com.smartdoor.entity.LockPassword;

public interface LockPasswordService extends IService<LockPassword> {
    Result<PageResult<LockPassword>> getPasswordPage(LockPasswordQueryDTO queryDTO);
    Result<LockPassword> getPasswordDetail(Long id);
    Result<LockPassword> sendPassword(SendPasswordDTO dto);
    Result<Void> resendPassword(Long id);
    Result<Void> cancelPassword(Long id);
    Result<Void> freezePassword(Long id);
    Result<Void> unfreezePassword(Long id);
    void checkPasswordExpire();
}
