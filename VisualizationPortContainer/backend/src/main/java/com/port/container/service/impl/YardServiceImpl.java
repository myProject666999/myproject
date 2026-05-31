package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.entity.Yard;
import com.port.container.entity.YardSlot;
import com.port.container.mapper.YardMapper;
import com.port.container.mapper.YardSlotMapper;
import com.port.container.service.OperationLogService;
import com.port.container.service.YardService;
import com.port.container.vo.YardOverviewVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class YardServiceImpl extends ServiceImpl<YardMapper, Yard> implements YardService {

    @Autowired
    private YardMapper yardMapper;

    @Autowired
    private YardSlotMapper yardSlotMapper;

    @Autowired
    private OperationLogService operationLogService;

    @Override
    public Yard getById(Long id) {
        return yardMapper.selectById(id);
    }

    @Override
    public List<Yard> list() {
        return yardMapper.selectList(null);
    }

    @Override
    public IPage<Yard> page(Long current, Long size) {
        Page<Yard> page = new Page<>(current, size);
        return yardMapper.selectPage(page, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(Yard yard) {
        Yard before = null;
        int result = yardMapper.insert(yard);
        operationLogService.logOperation("堆场管理", "新增", yard.getId(), yard.getYardCode(),
                before, yard, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(Yard yard) {
        Yard before = yardMapper.selectById(yard.getId());
        int result = yardMapper.updateById(yard);
        operationLogService.logOperation("堆场管理", "修改", yard.getId(), yard.getYardCode(),
                before, yard, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        Yard before = yardMapper.selectById(id);
        int result = yardMapper.deleteById(id);
        if (before != null) {
            operationLogService.logOperation("堆场管理", "删除", id, before.getYardCode(),
                    before, null, null, null, null);
        }
        return result > 0;
    }

    @Override
    public YardOverviewVO getYardOverview(Long yardId) {
        Yard yard = yardMapper.selectById(yardId);
        if (yard == null) {
            return null;
        }
        return buildYardOverview(yard);
    }

    @Override
    public List<YardOverviewVO> getAllYardOverviews() {
        List<Yard> yards = yardMapper.selectList(null);
        return yards.stream()
                .map(this::buildYardOverview)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateYardSlotCount(Long yardId) {
        LambdaQueryWrapper<YardSlot> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(YardSlot::getYardId, yardId);
        List<YardSlot> slots = yardSlotMapper.selectList(wrapper);

        int totalSlots = slots.size();
        int occupiedSlots = (int) slots.stream()
                .filter(slot -> slot.getStatus() != null && slot.getStatus() == 2)
                .count();

        Yard yard = new Yard();
        yard.setId(yardId);
        yard.setTotalSlots(totalSlots);
        yard.setOccupiedSlots(occupiedSlots);

        return yardMapper.updateById(yard) > 0;
    }

    private YardOverviewVO buildYardOverview(Yard yard) {
        YardOverviewVO vo = new YardOverviewVO();
        vo.setId(yard.getId());
        vo.setYardCode(yard.getYardCode());
        vo.setYardName(yard.getYardName());
        vo.setArea(yard.getArea());
        vo.setTotalSlots(yard.getTotalSlots());
        vo.setOccupiedSlots(yard.getOccupiedSlots());
        vo.setAvailableSlots(yard.getTotalSlots() - yard.getOccupiedSlots());
        if (yard.getTotalSlots() > 0) {
            vo.setOccupancyRate(BigDecimal.valueOf(yard.getOccupiedSlots())
                    .divide(BigDecimal.valueOf(yard.getTotalSlots()), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)));
        } else {
            vo.setOccupancyRate(BigDecimal.ZERO);
        }
        vo.setMaxTiers(yard.getMaxTiers());
        vo.setRows(yard.getRows());
        vo.setBays(yard.getBays());
        vo.setStatus(yard.getStatus());
        vo.setCreateTime(yard.getCreateTime());
        vo.setUpdateTime(yard.getUpdateTime());

        LambdaQueryWrapper<YardSlot> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(YardSlot::getYardId, yard.getId());
        List<YardSlot> slots = yardSlotMapper.selectList(wrapper);

        Map<Integer, Integer> tierSlotCount = new HashMap<>();
        Map<Integer, Integer> tierOccupiedCount = new HashMap<>();

        for (YardSlot slot : slots) {
            Integer tier = slot.getTierNum();
            tierSlotCount.merge(tier, 1, Integer::sum);
            if (slot.getStatus() != null && slot.getStatus() == 2) {
                tierOccupiedCount.merge(tier, 1, Integer::sum);
            }
        }

        vo.setTierSlotCount(tierSlotCount);
        vo.setTierOccupiedCount(tierOccupiedCount);

        return vo;
    }
}
