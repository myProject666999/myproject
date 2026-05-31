package com.market.stall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.AuditDTO;
import com.market.stall.dto.RegistrationDTO;
import com.market.stall.entity.Registration;
import com.market.stall.vo.RegistrationVO;

public interface RegistrationService {

    void submitRegistration(RegistrationDTO dto, Long userId);

    IPage<RegistrationVO> pageRegistrations(IPage<Registration> page, Long eventId, Integer auditStatus, Integer status);

    RegistrationVO getRegistrationDetail(Long id);

    void auditRegistration(AuditDTO dto, Long auditorId);

    void cancelRegistration(Long id, Long userId);
}
