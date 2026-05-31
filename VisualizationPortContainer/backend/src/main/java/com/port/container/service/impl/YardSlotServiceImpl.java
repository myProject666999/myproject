package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.dto.SlotQueryDTO;
import com.port.container.entity.YardSlot;
import com.port.container.mapper.YardSlotMapper;
import com.port.container.service.OperationLogService;
import com.port.container.service.YardService;
import com.port.container.service.YardSlotService;
import com.port.container.vo.SlotHeatmapVO;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class YardSlotServiceImpl extends ServiceImpl<YardSlotMapper, YardSlot> implements YardSlotService {

    @Autowired
    private YardSlotMapper yardSlotMapper;

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private YardService yardService;

    @Autowired
    private RedissonClient redissonClient;

    private static final String SLOT_LOCK_PREFIX = "yard:slot:lock:";
    private static final int SLOT_STATUS_AVAILABLE = 1;
    private static final int SLOT_STATUS_OCCUPIED = 2;
    private static final int SLOT_STATUS_LOCKED = 3;
    private static final int SLOT_STATUS_MAINTENANCE = 4;

    @Override
    public YardSlot getById(Long id) {
        return yardSlotMapper.selectById(id);
    }

    @Override
    public List<YardSlot> list() {
        return yardSlotMapper.selectList(null);
    }

    @Override
    public IPage<YardSlot> page(Long current, Long size) {
        Page<YardSlot> page = new Page<>(current, size);
        return yardSlotMapper.selectPage(page, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(YardSlot yardSlot) {
        YardSlot before = null;
        int result = yardSlotMapper.insert(yardSlot);
        operationLogService.logOperation("箱位管理", "新增", yardSlot.getId(), yardSlot.getSlotCode(),
                before, yardSlot, null, null, null);
        if (result > 0 && yardSlot.getYardId() != null) {
            yardService.updateYardSlotCount(yardSlot.getYardId());
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(YardSlot yardSlot) {
        YardSlot before = yardSlotMapper.selectById(yardSlot.getId());
        int result = yardSlotMapper.updateById(yardSlot);
        operationLogService.logOperation("箱位管理", "修改", yardSlot.getId(), yardSlot.getSlotCode(),
                before, yardSlot, null, null, null);
        if (result > 0 && yardSlot.getYardId() != null) {
            yardService.updateYardSlotCount(yardSlot.getYardId());
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        YardSlot before = yardSlotMapper.selectById(id);
        int result = yardSlotMapper.deleteById(id);
        if (before != null) {
            operationLogService.logOperation("箱位管理", "删除", id, before.getSlotCode(),
                    before, null, null, null, null);
            if (before.getYardId() != null) {
                yardService.updateYardSlotCount(before.getYardId());
            }
        }
        return result > 0;
    }

    @Override
    public List<YardSlot> getAvailableSlots(SlotQueryDTO dto) {
        LambdaQueryWrapper<YardSlot> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(YardSlot::getStatus, SLOT_STATUS_AVAILABLE);

        if (dto.getYardId() != null) {
            wrapper.eq(YardSlot::getYardId, dto.getYardId());
        }
        if (dto.getRowNum() != null) {
            wrapper.eq(YardSlot::getRowNum, dto.getRowNum());
        }
        if (dto.getBayNum() != null) {
            wrapper.eq(YardSlot::getBayNum, dto.getBayNum());
        }
        if (dto.getTierNum() != null) {
            wrapper.eq(YardSlot::getTierNum, dto.getTierNum());
        }
        if (dto.getContainerType() != null) {
            wrapper.eq(YardSlot::getContainerType, dto.getContainerType());
        }
        if (dto.getMinWeight() != null) {
            wrapper.ge(YardSlot::getMaxWeight, dto.getMinWeight());
        }
        if (dto.getMaxWeight() != null) {
            wrapper.le(YardSlot::getMaxWeight, dto.getMaxWeight());
        }

        wrapper.orderByAsc(YardSlot::getTierNum)
                .orderByAsc(YardSlot::getRowNum)
                .orderByAsc(YardSlot::getBayNum);

        return yardSlotMapper.selectList(wrapper);
    }

    @Override
    public List<YardSlot> getSlotsByYardAndLayer(Long yardId, Integer tierNo) {
        LambdaQueryWrapper<YardSlot> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(YardSlot::getYardId, yardId)
                .eq(YardSlot::getTierNum, tierNo)
                .orderByAsc(YardSlot::getRowNum)
                .orderByAsc(YardSlot::getBayNum);
        return yardSlotMapper.selectList(wrapper);
    }

    @Override
    public List<SlotHeatmapVO> getSlotHeatmapData(Long yardId) {
        LambdaQueryWrapper<YardSlot> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(YardSlot::getYardId, yardId);
        List<YardSlot> slots = yardSlotMapper.selectList(wrapper);

        return slots.stream().map(slot -> {
            SlotHeatmapVO vo = new SlotHeatmapVO();
            vo.setRowNum(slot.getRowNum());
            vo.setBayNum(slot.getBayNum());
            vo.setTierNum(slot.getTierNum());
            vo.setStatus(slot.getStatus());
            vo.setContainerId(slot.getCurrentContainerId());
            vo.setValue(slot.getStatus() != null ? slot.getStatus() : 0);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockSlot(Long slotId, Long operatorId) {
        String lockKey = SLOT_LOCK_PREFIX + slotId;
        RLock lock = redissonClient.getLock(lockKey);
        try {
            if (!lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                return false;
            }
            try {
                YardSlot slot = yardSlotMapper.selectById(slotId);
                if (slot == null || slot.getStatus() != SLOT_STATUS_AVAILABLE) {
                    return false;
                }
                YardSlot before = new YardSlot();
                before.setStatus(slot.getStatus());

                LambdaUpdateWrapper<YardSlot> wrapper = new LambdaUpdateWrapper<>();
                wrapper.eq(YardSlot::getId, slotId)
                        .eq(YardSlot::getStatus, SLOT_STATUS_AVAILABLE)
                        .set(YardSlot::getStatus, SLOT_STATUS_LOCKED);

                int result = yardSlotMapper.update(null, wrapper);
                if (result > 0) {
                    YardSlot after = new YardSlot();
                    after.setStatus(SLOT_STATUS_LOCKED);
                    operationLogService.logOperation("箱位管理", "锁定", slotId, slot.getSlotCode(),
                            before, after, operatorId, null, null);
                    if (slot.getYardId() != null) {
                        yardService.updateYardSlotCount(slot.getYardId());
                    }
                }
                return result > 0;
            } finally {
                lock.unlock();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean occupySlot(Long slotId, Long containerId) {
        YardSlot slot = yardSlotMapper.selectById(slotId);
        if (slot == null || (slot.getStatus() != SLOT_STATUS_AVAILABLE && slot.getStatus() != SLOT_STATUS_LOCKED)) {
            return false;
        }

        YardSlot before = new YardSlot();
        before.setStatus(slot.getStatus());
        before.setCurrentContainerId(slot.getCurrentContainerId());

        LambdaUpdateWrapper<YardSlot> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(YardSlot::getId, slotId)
                .in(YardSlot::getStatus, SLOT_STATUS_AVAILABLE, SLOT_STATUS_LOCKED)
                .set(YardSlot::getStatus, SLOT_STATUS_OCCUPIED)
                .set(YardSlot::getCurrentContainerId, containerId);

        int result = yardSlotMapper.update(null, wrapper);
        if (result > 0) {
            YardSlot after = new YardSlot();
            after.setStatus(SLOT_STATUS_OCCUPIED);
            after.setCurrentContainerId(containerId);
            operationLogService.logOperation("箱位管理", "占用", slotId, slot.getSlotCode(),
                    before, after, null, null, null);
            if (slot.getYardId() != null) {
                yardService.updateYardSlotCount(slot.getYardId());
            }
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean releaseSlot(Long slotId) {
        YardSlot slot = yardSlotMapper.selectById(slotId);
        if (slot == null) {
            return false;
        }

        YardSlot before = new YardSlot();
        before.setStatus(slot.getStatus());
        before.setCurrentContainerId(slot.getCurrentContainerId());

        LambdaUpdateWrapper<YardSlot> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(YardSlot::getId, slotId)
                .set(YardSlot::getStatus, SLOT_STATUS_AVAILABLE)
                .set(YardSlot::getCurrentContainerId, null);

        int result = yardSlotMapper.update(null, wrapper);
        if (result > 0) {
            YardSlot after = new YardSlot();
            after.setStatus(SLOT_STATUS_AVAILABLE);
            after.setCurrentContainerId(null);
            operationLogService.logOperation("箱位管理", "释放", slotId, slot.getSlotCode(),
                    before, after, null, null, null);
            if (slot.getYardId() != null) {
                yardService.updateYardSlotCount(slot.getYardId());
            }
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateSlotStatus(List<Long> slotIds, Integer status) {
        if (slotIds == null || slotIds.isEmpty()) {
            return false;
        }
        LambdaUpdateWrapper<YardSlot> wrapper = new LambdaUpdateWrapper<>();
        wrapper.in(YardSlot::getId, slotIds)
                .set(YardSlot::getStatus, status);
        int result = yardSlotMapper.update(null, wrapper);

        List<YardSlot> slots = yardSlotMapper.selectBatchIds(slotIds);
        for (YardSlot slot : slots) {
            operationLogService.logOperation("箱位管理", "批量更新状态", slot.getId(), slot.getSlotCode(),
                    null, status, null, null, null);
            if (slot.getYardId() != null) {
                yardService.updateYardSlotCount(slot.getYardId());
            }
        }
        return result > 0;
    }
}
