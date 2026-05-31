package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.AuditDTO;
import com.market.stall.dto.RegistrationDTO;
import com.market.stall.entity.Event;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.entity.SysUser;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.mapper.SysUserMapper;
import com.market.stall.service.RegistrationService;
import com.market.stall.vo.RegistrationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationMapper registrationMapper;
    private final EventMapper eventMapper;
    private final StallMapper stallMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public void submitRegistration(RegistrationDTO dto, Long userId) {
        Event event = eventMapper.selectById(dto.getEventId());
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getRegistrationStart()) || now.isAfter(event.getRegistrationEnd())) {
            throw new BusinessException("不在报名时间内");
        }
        Long count = registrationMapper.selectCount(
                new LambdaQueryWrapper<Registration>()
                        .eq(Registration::getEventId, dto.getEventId())
                        .eq(Registration::getUserId, userId)
        );
        if (count > 0) {
            throw new BusinessException("您已报名该活动");
        }
        Registration registration = new Registration();
        BeanUtils.copyProperties(dto, registration);
        registration.setUserId(userId);
        registration.setAuditStatus(0);
        registration.setStatus(0);
        registrationMapper.insert(registration);
    }

    @Override
    public IPage<RegistrationVO> pageRegistrations(IPage<Registration> page, Long eventId, Integer auditStatus, Integer status) {
        IPage<Registration> registrationPage = registrationMapper.selectPageByCondition(page, eventId, auditStatus, status);
        return registrationPage.convert(this::toRegistrationVO);
    }

    @Override
    public RegistrationVO getRegistrationDetail(Long id) {
        Registration registration = registrationMapper.selectById(id);
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        return toRegistrationVO(registration);
    }

    @Override
    public void auditRegistration(AuditDTO dto, Long auditorId) {
        Registration registration = registrationMapper.selectById(dto.getRegistrationId());
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        registration.setAuditStatus(dto.getAuditStatus());
        registration.setAuditRemark(dto.getAuditRemark());
        registration.setAuditBy(auditorId);
        registration.setAuditTime(LocalDateTime.now());
        if (dto.getAuditStatus() == 2) {
            if (registration.getStallId() != null) {
                Stall stall = stallMapper.selectById(registration.getStallId());
                if (stall != null) {
                    stall.setStatus(0);
                    stallMapper.updateById(stall);
                }
                registration.setStallId(null);
            }
            registration.setStatus(4);
        }
        registrationMapper.updateById(registration);
    }

    @Override
    public void cancelRegistration(Long id, Long userId) {
        Registration registration = registrationMapper.selectById(id);
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        if (!registration.getUserId().equals(userId)) {
            throw new BusinessException("无权取消该报名");
        }
        if (registration.getStallId() != null) {
            Stall stall = stallMapper.selectById(registration.getStallId());
            if (stall != null) {
                stall.setStatus(0);
                stallMapper.updateById(stall);
            }
        }
        registration.setStatus(4);
        registrationMapper.updateById(registration);
    }

    private RegistrationVO toRegistrationVO(Registration registration) {
        RegistrationVO vo = new RegistrationVO();
        BeanUtils.copyProperties(registration, vo);
        if (registration.getUserId() != null) {
            SysUser user = sysUserMapper.selectById(registration.getUserId());
            if (user != null) {
                vo.setUsername(user.getUsername());
            }
        }
        if (registration.getStallId() != null) {
            Stall stall = stallMapper.selectById(registration.getStallId());
            if (stall != null) {
                vo.setStallCode(stall.getStallCode());
            }
        }
        if (registration.getEventId() != null) {
            Event event = eventMapper.selectById(registration.getEventId());
            if (event != null) {
                vo.setEventName(event.getTitle());
            }
        }
        return vo;
    }
}
