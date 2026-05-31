package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.dto.AllocationSuggestionDTO;
import com.port.container.dto.SlotQueryDTO;
import com.port.container.entity.AllocationRecord;
import com.port.container.entity.Container;
import com.port.container.entity.Yard;
import com.port.container.entity.YardSlot;
import com.port.container.mapper.AllocationRecordMapper;
import com.port.container.mapper.ContainerMapper;
import com.port.container.mapper.YardMapper;
import com.port.container.mapper.YardSlotMapper;
import com.port.container.service.AllocationService;
import com.port.container.service.ContainerService;
import com.port.container.service.OperationLogService;
import com.port.container.service.YardSlotService;
import com.port.container.vo.AllocationSuggestionVO;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class AllocationServiceImpl extends ServiceImpl<AllocationRecordMapper, AllocationRecord> implements AllocationService {

    @Autowired
    private AllocationRecordMapper allocationRecordMapper;

    @Autowired
    private YardSlotMapper yardSlotMapper;

    @Autowired
    private YardMapper yardMapper;

    @Autowired
    private ContainerMapper containerMapper;

    @Autowired
    private YardSlotService yardSlotService;

    @Autowired
    private ContainerService containerService;

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private RedissonClient redissonClient;

    private static final String ALLOCATION_LOCK_PREFIX = "yard:allocation:lock:";
    private static final String ALLOCATION_NO_PREFIX = "ALLOC";

    private static final int ALLOCATION_STATUS_CONFIRMED = 1;
    private static final int ALLOCATION_STATUS_CANCELLED = 2;

    private static final String STRATEGY_NEAREST = "nearest";
    private static final String STRATEGY_WEIGHT = "weight";
    private static final String STRATEGY_BALANCE = "balance";

    @Override
    public List<AllocationSuggestionVO> suggestSlot(AllocationSuggestionDTO dto) {
        SlotQueryDTO queryDTO = new SlotQueryDTO();
        queryDTO.setYardId(dto.getYardId());
        queryDTO.setContainerType(dto.getContainerType());
        queryDTO.setMaxWeight(dto.getWeight());

        List<YardSlot> availableSlots = yardSlotService.getAvailableSlots(queryDTO);
        if (availableSlots == null || availableSlots.isEmpty()) {
            return new ArrayList<>();
        }

        String strategy = dto.getStrategy() != null ? dto.getStrategy() : STRATEGY_BALANCE;
        int topN = dto.getTopN() != null ? dto.getTopN() : 5;

        List<AllocationSuggestionVO> suggestions = availableSlots.stream()
                .map(slot -> calculateScore(slot, dto, strategy))
                .sorted(Comparator.comparingInt(AllocationSuggestionVO::getScore).reversed())
                .limit(topN)
                .collect(Collectors.toList());

        return suggestions;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean confirmAllocation(Long containerId, Long slotId, String strategyName, Long operatorId) {
        String lockKey = ALLOCATION_LOCK_PREFIX + containerId;
        RLock lock = redissonClient.getLock(lockKey);
        try {
            if (!lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                throw new RuntimeException("该集装箱正在分配中，请稍后再试");
            }
            try {
                Container container = containerMapper.selectById(containerId);
                if (container == null) {
                    throw new RuntimeException("集装箱不存在");
                }

                YardSlot slot = yardSlotMapper.selectById(slotId);
                if (slot == null) {
                    throw new RuntimeException("箱位不存在");
                }

                AllocationRecord record = new AllocationRecord();
                record.setAllocationNo(generateAllocationNo());
                record.setContainerId(containerId);
                record.setContainerNo(container.getContainerNo());
                record.setYardId(slot.getYardId());
                record.setSlotId(slotId);
                record.setSlotCode(slot.getSlotCode());
                record.setAllocationStrategy(strategyName);
                record.setStatus(ALLOCATION_STATUS_CONFIRMED);
                record.setAllocateTime(LocalDateTime.now());
                record.setOperatorId(operatorId);

                Yard yard = yardMapper.selectById(slot.getYardId());
                if (yard != null) {
                    record.setYardCode(yard.getYardCode());
                }

                allocationRecordMapper.insert(record);

                boolean slotResult = yardSlotService.occupySlot(slotId, containerId);
                if (!slotResult) {
                    throw new RuntimeException("箱位占用失败");
                }

                boolean containerResult = containerService.updateContainerSlot(containerId, slotId);
                if (!containerResult) {
                    throw new RuntimeException("更新集装箱箱位失败");
                }

                operationLogService.logOperation("分配管理", "确认分配", containerId, container.getContainerNo(),
                        null, record, operatorId, null, null);

                return true;
            } finally {
                lock.unlock();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    @Override
    public List<AllocationRecord> getAllocationHistory(Long containerId) {
        LambdaQueryWrapper<AllocationRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AllocationRecord::getContainerId, containerId)
                .orderByDesc(AllocationRecord::getAllocateTime);
        return allocationRecordMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean autoAllocate(Long containerId, Long operatorId) {
        Container container = containerMapper.selectById(containerId);
        if (container == null) {
            throw new RuntimeException("集装箱不存在");
        }

        AllocationSuggestionDTO suggestionDTO = new AllocationSuggestionDTO();
        suggestionDTO.setContainerId(containerId);
        suggestionDTO.setContainerNo(container.getContainerNo());
        suggestionDTO.setContainerType(container.getContainerType());
        suggestionDTO.setWeight(container.getGrossWeight());
        suggestionDTO.setYardId(container.getYardId());
        suggestionDTO.setStrategy(STRATEGY_BALANCE);
        suggestionDTO.setTopN(1);

        List<AllocationSuggestionVO> suggestions = suggestSlot(suggestionDTO);
        if (suggestions == null || suggestions.isEmpty()) {
            throw new RuntimeException("没有可用的箱位");
        }

        AllocationSuggestionVO bestSuggestion = suggestions.get(0);
        return confirmAllocation(containerId, bestSuggestion.getSlotId(),
                bestSuggestion.getStrategy(), operatorId);
    }

    private AllocationSuggestionVO calculateScore(YardSlot slot, AllocationSuggestionDTO dto, String strategy) {
        AllocationSuggestionVO vo = new AllocationSuggestionVO();
        vo.setSlotId(slot.getId());
        vo.setSlotCode(slot.getSlotCode());
        vo.setYardId(slot.getYardId());
        vo.setRowNum(slot.getRowNum());
        vo.setBayNum(slot.getBayNum());
        vo.setTierNum(slot.getTierNum());
        vo.setMaxWeight(slot.getMaxWeight());
        vo.setContainerType(slot.getContainerType());
        vo.setStrategy(strategy);

        Yard yard = yardMapper.selectById(slot.getYardId());
        if (yard != null) {
            vo.setYardCode(yard.getYardCode());
        }

        int score = 0;
        StringBuilder reason = new StringBuilder();

        switch (strategy) {
            case STRATEGY_NEAREST:
                score = 100 - (slot.getRowNum() + slot.getBayNum());
                reason.append("就近原则：位置");
                reason.append(slot.getRowNum()).append("-").append(slot.getBayNum());
                break;
            case STRATEGY_WEIGHT:
                if (slot.getMaxWeight() != null && dto.getWeight() != null) {
                    BigDecimal weightDiff = slot.getMaxWeight().subtract(dto.getWeight());
                    score = weightDiff.multiply(BigDecimal.valueOf(10)).intValue();
                    reason.append("承重适配：可承重").append(slot.getMaxWeight()).append("吨");
                }
                break;
            case STRATEGY_BALANCE:
            default:
                int baseScore = 50;
                int tierBonus = (10 - Math.min(slot.getTierNum(), 10)) * 3;
                int rowBonus = (10 - Math.min(slot.getRowNum(), 10)) * 2;
                int bayBonus = (10 - Math.min(slot.getBayNum(), 10)) * 2;
                score = baseScore + tierBonus + rowBonus + bayBonus;
                reason.append("综合平衡：低层优先、就近原则");
                break;
        }

        vo.setScore(Math.max(score, 0));
        vo.setReason(reason.toString());

        return vo;
    }

    private String generateAllocationNo() {
        return ALLOCATION_NO_PREFIX + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
