package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.common.ResultCode;
import com.smartdoor.dto.LockPasswordQueryDTO;
import com.smartdoor.dto.SendPasswordDTO;
import com.smartdoor.entity.DoorLock;
import com.smartdoor.entity.LeaseContract;
import com.smartdoor.entity.LockPassword;
import com.smartdoor.entity.Tenant;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.LockPasswordMapper;
import com.smartdoor.service.DoorLockService;
import com.smartdoor.service.LeaseContractService;
import com.smartdoor.service.LockPasswordService;
import com.smartdoor.service.TenantService;
import com.smartdoor.utils.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class LockPasswordServiceImpl extends ServiceImpl<LockPasswordMapper, LockPassword> implements LockPasswordService {
    private static final Logger log = LoggerFactory.getLogger(LockPasswordServiceImpl.class);

    @Autowired
    private DoorLockService doorLockService;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private LeaseContractService leaseContractService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private static final String PASSWORD_SEND_KEY = "lock:password:send:";

    @Override
    public Result<PageResult<LockPassword>> getPasswordPage(LockPasswordQueryDTO queryDTO) {
        LambdaQueryWrapper<LockPassword> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getPasswordNo())) {
            wrapper.like(LockPassword::getPasswordNo, queryDTO.getPasswordNo());
        }
        if (queryDTO.getLockId() != null) {
            wrapper.eq(LockPassword::getLockId, queryDTO.getLockId());
        }
        if (StringUtils.hasText(queryDTO.getLockNo())) {
            wrapper.like(LockPassword::getLockNo, queryDTO.getLockNo());
        }
        if (queryDTO.getApartmentId() != null) {
            wrapper.eq(LockPassword::getApartmentId, queryDTO.getApartmentId());
        }
        if (queryDTO.getContractId() != null) {
            wrapper.eq(LockPassword::getContractId, queryDTO.getContractId());
        }
        if (queryDTO.getTenantId() != null) {
            wrapper.eq(LockPassword::getTenantId, queryDTO.getTenantId());
        }
        if (StringUtils.hasText(queryDTO.getPasswordType())) {
            wrapper.eq(LockPassword::getPasswordType, queryDTO.getPasswordType());
        }
        if (StringUtils.hasText(queryDTO.getPermissionType())) {
            wrapper.eq(LockPassword::getPermissionType, queryDTO.getPermissionType());
        }
        if (StringUtils.hasText(queryDTO.getSendStatus())) {
            wrapper.eq(LockPassword::getSendStatus, queryDTO.getSendStatus());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            wrapper.eq(LockPassword::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getEffectiveTimeStart() != null) {
            wrapper.ge(LockPassword::getEffectiveTime, queryDTO.getEffectiveTimeStart());
        }
        if (queryDTO.getEffectiveTimeEnd() != null) {
            wrapper.le(LockPassword::getEffectiveTime, queryDTO.getEffectiveTimeEnd());
        }
        if (queryDTO.getExpireTimeStart() != null) {
            wrapper.ge(LockPassword::getExpireTime, queryDTO.getExpireTimeStart());
        }
        if (queryDTO.getExpireTimeEnd() != null) {
            wrapper.le(LockPassword::getExpireTime, queryDTO.getExpireTimeEnd());
        }

        wrapper.orderByDesc(LockPassword::getCreateTime);

        Page<LockPassword> page = this.page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(),
                queryDTO.getPageNum(), queryDTO.getPageSize()));
    }

    @Override
    public Result<LockPassword> getPasswordDetail(Long id) {
        LockPassword password = this.getById(id);
        if (password == null) {
            throw new BusinessException("密码记录不存在");
        }
        return Result.success(password);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<LockPassword> sendPassword(SendPasswordDTO dto) {
        DoorLock doorLock = doorLockService.getById(dto.getLockId());
        if (doorLock == null) {
            throw new BusinessException("门锁不存在");
        }

        if ("OFFLINE".equals(doorLock.getNetworkStatus())) {
            throw new BusinessException(ResultCode.LOCK_OFFLINE);
        }

        if ("FAULT".equals(doorLock.getLockStatus())) {
            throw new BusinessException("门锁故障，无法下发密码");
        }

        if (dto.getTenantId() != null) {
            Tenant tenant = tenantService.getById(dto.getTenantId());
            if (tenant == null) {
                throw new BusinessException("租客不存在");
            }
        }

        if (dto.getContractId() != null) {
            LeaseContract contract = leaseContractService.getById(dto.getContractId());
            if (contract == null) {
                throw new BusinessException("租约不存在");
            }
            if ("EXPIRED".equals(contract.getStatus()) || "TERMINATED".equals(contract.getStatus())) {
                throw new BusinessException(ResultCode.CONTRACT_EXPIRED);
            }
        }

        LocalDateTime effectiveTime = dto.getEffectiveTime() != null ? dto.getEffectiveTime() : LocalDateTime.now();
        LocalDateTime expireTime = dto.getExpireTime();
        if (expireTime == null) {
            if ("TEMPORARY".equals(dto.getPasswordType())) {
                expireTime = effectiveTime.plusHours(24);
            } else if ("PERMANENT".equals(dto.getPasswordType())) {
                expireTime = effectiveTime.plusYears(1);
            } else {
                expireTime = effectiveTime.plusHours(4);
            }
        }

        if (expireTime.isBefore(effectiveTime)) {
            throw new BusinessException("过期时间不能早于生效时间");
        }

        String requestId = PasswordGenerator.generateRequestId();
        String idempotentKey = PASSWORD_SEND_KEY + requestId;
        Boolean ifAbsent = stringRedisTemplate.opsForValue().setIfAbsent(idempotentKey, "1", 1, TimeUnit.HOURS);
        if (!Boolean.TRUE.equals(ifAbsent)) {
            LockPassword existPassword = this.getOne(
                    new LambdaQueryWrapper<LockPassword>().eq(LockPassword::getSendRequestId, requestId)
            );
            if (existPassword != null) {
                return Result.success("重复请求，返回已有数据", existPassword);
            }
            throw new BusinessException("请求过于频繁，请稍后再试");
        }

        String password = PasswordGenerator.generateLockPassword();

        LockPassword lockPassword = new LockPassword();
        lockPassword.setPasswordNo(PasswordGenerator.generatePasswordNo());
        lockPassword.setLockId(dto.getLockId());
        lockPassword.setLockNo(doorLock.getLockNo());
        lockPassword.setApartmentId(doorLock.getApartmentId());
        lockPassword.setContractId(dto.getContractId());
        lockPassword.setTenantId(dto.getTenantId());
        lockPassword.setTenantName(dto.getTenantName());
        lockPassword.setPasswordType(dto.getPasswordType());
        lockPassword.setPassword(password);
        lockPassword.setEffectiveTime(effectiveTime);
        lockPassword.setExpireTime(expireTime);
        lockPassword.setPermissionType(dto.getPermissionType() != null ? dto.getPermissionType() : "TENANT");
        lockPassword.setUseLimit(dto.getUseLimit() != null ? dto.getUseLimit() : -1);
        lockPassword.setUsedCount(0);
        lockPassword.setSendStatus("PENDING");
        lockPassword.setSendRequestId(requestId);
        lockPassword.setStatus("ACTIVE");

        boolean sendSuccess = sendToLockDevice(doorLock.getLockNo(), password, effectiveTime, expireTime);

        if (sendSuccess) {
            lockPassword.setSendStatus("SUCCESS");
            lockPassword.setSendTime(LocalDateTime.now());
            log.info("密码下发成功: lockNo={}, password={}, tenant={}",
                    doorLock.getLockNo(), password, dto.getTenantName());
        } else {
            lockPassword.setSendStatus("FAILED");
            lockPassword.setSendFailReason("门锁设备响应超时");
            log.error("密码下发失败: lockNo={}", doorLock.getLockNo());
        }

        this.save(lockPassword);

        return Result.success(lockPassword);
    }

    private boolean sendToLockDevice(String lockNo, String password, LocalDateTime effectiveTime, LocalDateTime expireTime) {
        try {
            Thread.sleep(100);
            return true;
        } catch (Exception e) {
            log.error("调用门锁设备接口异常", e);
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> resendPassword(Long id) {
        LockPassword password = this.getById(id);
        if (password == null) {
            throw new BusinessException("密码记录不存在");
        }

        if ("EXPIRED".equals(password.getStatus())) {
            throw new BusinessException(ResultCode.PASSWORD_EXPIRED);
        }

        if ("CANCELLED".equals(password.getStatus())) {
            throw new BusinessException("密码已取消，无法重发");
        }

        DoorLock doorLock = doorLockService.getById(password.getLockId());
        if (doorLock == null || "OFFLINE".equals(doorLock.getNetworkStatus())) {
            throw new BusinessException(ResultCode.LOCK_OFFLINE);
        }

        String requestId = PasswordGenerator.generateRequestId();
        String idempotentKey = PASSWORD_SEND_KEY + "resend:" + id;
        Boolean ifAbsent = stringRedisTemplate.opsForValue().setIfAbsent(idempotentKey, "1", 5, TimeUnit.MINUTES);
        if (!Boolean.TRUE.equals(ifAbsent)) {
            throw new BusinessException("操作过于频繁，请5分钟后再试");
        }

        boolean sendSuccess = sendToLockDevice(password.getLockNo(), password.getPassword(),
                password.getEffectiveTime(), password.getExpireTime());

        if (sendSuccess) {
            password.setSendStatus("SUCCESS");
            password.setSendTime(LocalDateTime.now());
            password.setSendRequestId(requestId);
            password.setSendFailReason(null);
            log.info("密码重发成功: passwordNo={}", password.getPasswordNo());
        } else {
            password.setSendStatus("FAILED");
            password.setSendFailReason("门锁设备响应超时");
            log.error("密码重发失败: passwordNo={}", password.getPasswordNo());
        }

        this.updateById(password);

        return Result.success();
    }

    @Override
    public Result<Void> cancelPassword(Long id) {
        LockPassword password = this.getById(id);
        if (password == null) {
            throw new BusinessException("密码记录不存在");
        }

        if ("EXPIRED".equals(password.getStatus()) || "CANCELLED".equals(password.getStatus())) {
            throw new BusinessException("密码已过期或已取消");
        }

        password.setStatus("CANCELLED");
        this.updateById(password);

        log.info("取消密码成功: passwordNo={}", password.getPasswordNo());
        return Result.success();
    }

    @Override
    public Result<Void> freezePassword(Long id) {
        LockPassword password = this.getById(id);
        if (password == null) {
            throw new BusinessException("密码记录不存在");
        }

        if (!"ACTIVE".equals(password.getStatus())) {
            throw new BusinessException("只有有效密码才能冻结");
        }

        password.setStatus("FROZEN");
        this.updateById(password);

        log.info("冻结密码成功: passwordNo={}", password.getPasswordNo());
        return Result.success();
    }

    @Override
    public Result<Void> unfreezePassword(Long id) {
        LockPassword password = this.getById(id);
        if (password == null) {
            throw new BusinessException("密码记录不存在");
        }

        if (!"FROZEN".equals(password.getStatus())) {
            throw new BusinessException("只有冻结密码才能解冻");
        }

        if (password.getExpireTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ResultCode.PASSWORD_EXPIRED);
        }

        password.setStatus("ACTIVE");
        this.updateById(password);

        log.info("解冻密码成功: passwordNo={}", password.getPasswordNo());
        return Result.success();
    }

    @Override
    public void checkPasswordExpire() {
        LocalDateTime now = LocalDateTime.now();
        LambdaQueryWrapper<LockPassword> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LockPassword::getStatus, "ACTIVE")
                .le(LockPassword::getExpireTime, now);

        this.list(wrapper).forEach(password -> {
            password.setStatus("EXPIRED");
            this.updateById(password);
            log.info("密码自动过期: passwordNo={}", password.getPasswordNo());
        });
    }
}
