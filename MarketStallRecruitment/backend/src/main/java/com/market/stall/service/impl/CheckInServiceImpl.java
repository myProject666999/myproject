package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.market.stall.dto.CheckInDTO;
import com.market.stall.entity.CheckIn;
import com.market.stall.entity.Event;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.entity.SysUser;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.CheckInMapper;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.mapper.SysUserMapper;
import com.market.stall.service.CheckInService;
import com.market.stall.vo.CheckInVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckInServiceImpl implements CheckInService {

    private final CheckInMapper checkInMapper;
    private final RegistrationMapper registrationMapper;
    private final EventMapper eventMapper;
    private final StallMapper stallMapper;
    private final SysUserMapper sysUserMapper;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public String generateCheckInCode(Long registrationId, Long userId) {
        Registration registration = registrationMapper.selectById(registrationId);
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        if (!registration.getUserId().equals(userId)) {
            throw new BusinessException("无权操作");
        }
        if (registration.getStatus() != 2 && registration.getStatus() != 1) {
            throw new BusinessException("报名状态不可签到");
        }
        Event event = eventMapper.selectById(registration.getEventId());
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        String code = UUID.randomUUID().toString().replace("-", "");
        String redisKey = "checkin:code:" + code;
        LocalDateTime expireAt = event.getEndTime();
        Duration duration = Duration.between(LocalDateTime.now(), expireAt);
        if (duration.isNegative() || duration.isZero()) {
            duration = Duration.ofMinutes(30);
        }
        stringRedisTemplate.opsForValue().set(redisKey, String.valueOf(registrationId), duration.getSeconds(), TimeUnit.SECONDS);
        return code;
    }

    @Override
    public CheckInVO checkIn(CheckInDTO dto, Long verifierId) {
        String redisKey = "checkin:code:" + dto.getCheckInCode();
        String registrationIdStr = stringRedisTemplate.opsForValue().get(redisKey);
        if (registrationIdStr == null) {
            throw new BusinessException("签到码无效或已过期");
        }
        Long registrationId = Long.valueOf(registrationIdStr);
        Registration registration = registrationMapper.selectById(registrationId);
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        Event event = eventMapper.selectById(dto.getEventId());
        if (event == null || event.getStatus() == null || event.getStatus() != 1) {
            throw new BusinessException("活动未进行中");
        }
        if (registration.getStatus() != 2 && registration.getStatus() != 1) {
            throw new BusinessException("报名未支付，不可签到");
        }
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        Long todayCount = checkInMapper.selectCount(
                new LambdaQueryWrapper<CheckIn>()
                        .eq(CheckIn::getRegistrationId, registrationId)
                        .eq(CheckIn::getEventId, dto.getEventId())
                        .between(CheckIn::getCheckInTime, todayStart, todayEnd)
        );
        if (todayCount > 0) {
            throw new BusinessException("今日已签到");
        }
        CheckIn checkIn = new CheckIn();
        checkIn.setEventId(dto.getEventId());
        checkIn.setRegistrationId(registrationId);
        checkIn.setUserId(registration.getUserId());
        checkIn.setStallId(registration.getStallId());
        checkIn.setCheckInTime(LocalDateTime.now());
        checkIn.setCheckInCode(dto.getCheckInCode());
        checkIn.setVerifiedBy(verifierId);
        checkIn.setStatus(1);
        checkInMapper.insert(checkIn);
        registration.setStatus(3);
        registrationMapper.updateById(registration);
        stringRedisTemplate.delete(redisKey);
        return toCheckInVO(checkIn);
    }

    @Override
    public List<CheckInVO> getCheckInList(Long eventId) {
        List<CheckIn> checkIns = checkInMapper.selectList(
                new LambdaQueryWrapper<CheckIn>()
                        .eq(CheckIn::getEventId, eventId)
                        .orderByDesc(CheckIn::getCheckInTime)
        );
        return checkIns.stream().map(this::toCheckInVO).collect(Collectors.toList());
    }

    private CheckInVO toCheckInVO(CheckIn checkIn) {
        CheckInVO vo = new CheckInVO();
        BeanUtils.copyProperties(checkIn, vo);
        if (checkIn.getUserId() != null) {
            SysUser user = sysUserMapper.selectById(checkIn.getUserId());
            if (user != null) {
                vo.setUsername(user.getUsername());
                vo.setRealName(user.getRealName());
            }
        }
        if (checkIn.getStallId() != null) {
            Stall stall = stallMapper.selectById(checkIn.getStallId());
            if (stall != null) {
                vo.setStallCode(stall.getStallCode());
            }
        }
        if (checkIn.getRegistrationId() != null) {
            Registration registration = registrationMapper.selectById(checkIn.getRegistrationId());
            if (registration != null) {
                vo.setBusinessName(registration.getBusinessName());
            }
        }
        return vo;
    }
}
