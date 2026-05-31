package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.market.stall.dto.StallSelectDTO;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.entity.StallLock;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallLockMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.service.StallSelectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class StallSelectionServiceImpl implements StallSelectionService {

    private final StallMapper stallMapper;
    private final RegistrationMapper registrationMapper;
    private final StallLockMapper stallLockMapper;
    private final EventMapper eventMapper;
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${stall.lock.expire-minutes}")
    private Integer expireMinutes;

    @Override
    @Transactional
    public String selectStall(StallSelectDTO dto, Long userId) {
        String lockKey = "stall:lock:" + dto.getEventId() + ":" + dto.getStallId();
        Boolean locked = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, String.valueOf(userId), expireMinutes, TimeUnit.MINUTES);
        if (locked == null || !locked) {
            throw new BusinessException("该摊位正在被其他人选择，请稍后再试");
        }
        try {
            Stall stall = stallMapper.selectById(dto.getStallId());
            if (stall == null) {
                throw new BusinessException("摊位不存在");
            }
            if (!stall.getEventId().equals(dto.getEventId())) {
                throw new BusinessException("摊位不属于该活动");
            }
            if (stall.getStatus() != 0) {
                throw new BusinessException("摊位不可选");
            }
            Registration registration = registrationMapper.selectOne(
                    new LambdaQueryWrapper<Registration>()
                            .eq(Registration::getUserId, userId)
                            .eq(Registration::getEventId, dto.getEventId())
                            .ne(Registration::getStatus, 4)
                            .last("LIMIT 1")
            );
            if (registration == null) {
                throw new BusinessException("请先报名该活动");
            }
            if (registration.getAuditStatus() != 1) {
                throw new BusinessException("报名尚未通过审核");
            }
            if (registration.getStallId() != null) {
                throw new BusinessException("您已选择摊位");
            }
            StallLock stallLock = new StallLock();
            stallLock.setStallId(dto.getStallId());
            stallLock.setEventId(dto.getEventId());
            stallLock.setUserId(userId);
            stallLock.setLockTime(LocalDateTime.now());
            stallLock.setExpireTime(LocalDateTime.now().plusMinutes(expireMinutes));
            stallLock.setStatus(0);
            stallLockMapper.insert(stallLock);
            stall.setStatus(1);
            stallMapper.updateById(stall);
            registration.setStallId(dto.getStallId());
            registration.setStatus(1);
            registrationMapper.updateById(registration);
            return "选位成功";
        } catch (BusinessException e) {
            stringRedisTemplate.delete(lockKey);
            throw e;
        }
    }

    @Override
    @Transactional
    public void releaseExpiredLocks() {
        List<StallLock> expiredLocks = stallLockMapper.selectList(
                new LambdaQueryWrapper<StallLock>()
                        .eq(StallLock::getStatus, 0)
                        .lt(StallLock::getExpireTime, LocalDateTime.now())
        );
        for (StallLock lock : expiredLocks) {
            lock.setStatus(1);
            stallLockMapper.updateById(lock);
            Stall stall = stallMapper.selectById(lock.getStallId());
            if (stall != null && stall.getStatus() == 1) {
                stall.setStatus(0);
                stallMapper.updateById(stall);
            }
            Registration registration = registrationMapper.selectOne(
                    new LambdaQueryWrapper<Registration>()
                            .eq(Registration::getStallId, lock.getStallId())
                            .eq(Registration::getEventId, lock.getEventId())
                            .ne(Registration::getStatus, 4)
                            .last("LIMIT 1")
            );
            if (registration != null && registration.getStatus() == 1) {
                registration.setStallId(null);
                registration.setStatus(0);
                registrationMapper.updateById(registration);
            }
            String lockKey = "stall:lock:" + lock.getEventId() + ":" + lock.getStallId();
            stringRedisTemplate.delete(lockKey);
        }
    }

    @Override
    @Transactional
    public void confirmStall(Long registrationId, Long userId) {
        Registration registration = registrationMapper.selectById(registrationId);
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        if (!registration.getUserId().equals(userId)) {
            throw new BusinessException("无权确认该摊位");
        }
        if (registration.getStallId() == null) {
            throw new BusinessException("尚未选择摊位");
        }
        if (registration.getStatus() != 1) {
            throw new BusinessException("当前状态不可确认");
        }
        registration.setStatus(2);
        registrationMapper.updateById(registration);
        StallLock lock = stallLockMapper.selectOne(
                new LambdaQueryWrapper<StallLock>()
                        .eq(StallLock::getStallId, registration.getStallId())
                        .eq(StallLock::getUserId, userId)
                        .eq(StallLock::getStatus, 0)
                        .last("LIMIT 1")
        );
        if (lock != null) {
            lock.setStatus(2);
            stallLockMapper.updateById(lock);
        }
    }
}
