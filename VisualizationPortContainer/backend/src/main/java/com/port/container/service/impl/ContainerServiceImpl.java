package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.dto.ContainerInDTO;
import com.port.container.dto.ContainerOutDTO;
import com.port.container.dto.ContainerQueryDTO;
import com.port.container.entity.Container;
import com.port.container.entity.OperationLog;
import com.port.container.entity.Yard;
import com.port.container.entity.YardSlot;
import com.port.container.mapper.ContainerMapper;
import com.port.container.mapper.OperationLogMapper;
import com.port.container.mapper.YardMapper;
import com.port.container.mapper.YardSlotMapper;
import com.port.container.service.ContainerService;
import com.port.container.service.OperationLogService;
import com.port.container.service.YardService;
import com.port.container.service.YardSlotService;
import com.port.container.vo.ContainerDetailVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContainerServiceImpl extends ServiceImpl<ContainerMapper, Container> implements ContainerService {

    @Autowired
    private ContainerMapper containerMapper;

    @Autowired
    private YardSlotMapper yardSlotMapper;

    @Autowired
    private YardMapper yardMapper;

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private YardSlotService yardSlotService;

    @Autowired
    private YardService yardService;

    private static final int CONTAINER_STATUS_IN_YARD = 1;
    private static final int CONTAINER_STATUS_OUT_YARD = 2;

    @Override
    public Container getById(Long id) {
        return containerMapper.selectById(id);
    }

    @Override
    public List<Container> list() {
        return containerMapper.selectList(null);
    }

    @Override
    public IPage<Container> page(Long current, Long size) {
        Page<Container> page = new Page<>(current, size);
        return containerMapper.selectPage(page, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(Container container) {
        Container before = null;
        int result = containerMapper.insert(container);
        operationLogService.logOperation("集装箱管理", "新增", container.getId(), container.getContainerNo(),
                before, container, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(Container container) {
        Container before = containerMapper.selectById(container.getId());
        int result = containerMapper.updateById(container);
        operationLogService.logOperation("集装箱管理", "修改", container.getId(), container.getContainerNo(),
                before, container, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        Container before = containerMapper.selectById(id);
        int result = containerMapper.deleteById(id);
        if (before != null) {
            operationLogService.logOperation("集装箱管理", "删除", id, before.getContainerNo(),
                    before, null, null, null, null);
        }
        return result > 0;
    }

    @Override
    public Container getByContainerNo(String containerNo) {
        LambdaQueryWrapper<Container> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Container::getContainerNo, containerNo);
        return containerMapper.selectOne(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Container registerInbound(ContainerInDTO dto) {
        Container existing = getByContainerNo(dto.getContainerNo());
        if (existing != null && existing.getStatus() == CONTAINER_STATUS_IN_YARD) {
            throw new RuntimeException("集装箱已在场内");
        }

        Container container = new Container();
        BeanUtils.copyProperties(dto, container);
        container.setStatus(CONTAINER_STATUS_IN_YARD);
        container.setInTime(dto.getOutTime() != null ? dto.getOutTime() : LocalDateTime.now());

        if (existing != null) {
            container.setId(existing.getId());
            containerMapper.updateById(container);
        } else {
            containerMapper.insert(container);
        }

        operationLogService.logOperation("集装箱管理", "进场登记", container.getId(), container.getContainerNo(),
                null, container, dto.getOperatorId(), dto.getOperator(), null);

        return container;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Container registerOutbound(ContainerOutDTO dto) {
        Container container = getByContainerNo(dto.getContainerNo());
        if (container == null || container.getStatus() != CONTAINER_STATUS_IN_YARD) {
            throw new RuntimeException("集装箱不在场内");
        }

        Container before = new Container();
        BeanUtils.copyProperties(container, before);

        container.setStatus(CONTAINER_STATUS_OUT_YARD);
        container.setOutTime(dto.getOutTime() != null ? dto.getOutTime() : LocalDateTime.now());
        containerMapper.updateById(container);

        if (container.getSlotId() != null) {
            yardSlotService.releaseSlot(container.getSlotId());
        }

        operationLogService.logOperation("集装箱管理", "出场登记", container.getId(), container.getContainerNo(),
                before, container, dto.getOperatorId(), dto.getOperatorName(), null);

        if (container.getYardId() != null) {
            yardService.updateYardSlotCount(container.getYardId());
        }

        return container;
    }

    @Override
    public IPage<Container> getInYardContainers(ContainerQueryDTO dto) {
        LambdaQueryWrapper<Container> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Container::getStatus, CONTAINER_STATUS_IN_YARD);

        if (dto.getContainerNo() != null) {
            wrapper.like(Container::getContainerNo, dto.getContainerNo());
        }
        if (dto.getContainerType() != null) {
            wrapper.eq(Container::getContainerType, dto.getContainerType());
        }
        if (dto.getContainerSize() != null) {
            wrapper.eq(Container::getContainerSize, dto.getContainerSize());
        }
        if (dto.getYardId() != null) {
            wrapper.eq(Container::getYardId, dto.getYardId());
        }
        if (dto.getSlotId() != null) {
            wrapper.eq(Container::getSlotId, dto.getSlotId());
        }
        if (dto.getGoodsName() != null) {
            wrapper.like(Container::getGoodsName, dto.getGoodsName());
        }
        if (dto.getInTimeStart() != null) {
            wrapper.ge(Container::getInTime, dto.getInTimeStart());
        }
        if (dto.getInTimeEnd() != null) {
            wrapper.le(Container::getInTime, dto.getInTimeEnd());
        }

        wrapper.orderByDesc(Container::getInTime);

        Long current = dto.getCurrent() != null ? dto.getCurrent() : 1L;
        Long size = dto.getSize() != null ? dto.getSize() : 10L;
        Page<Container> page = new Page<>(current, size);

        return containerMapper.selectPage(page, wrapper);
    }

    @Override
    public ContainerDetailVO getContainerDetail(Long id) {
        Container container = containerMapper.selectById(id);
        if (container == null) {
            return null;
        }

        ContainerDetailVO vo = new ContainerDetailVO();
        vo.setContainer(container);

        if (container.getYardId() != null) {
            Yard yard = yardMapper.selectById(container.getYardId());
            if (yard != null) {
                vo.setYardName(yard.getYardName());
            }
        }

        if (container.getSlotId() != null) {
            YardSlot slot = yardSlotMapper.selectById(container.getSlotId());
            if (slot != null) {
                vo.setSlotCode(slot.getSlotCode());
            }
        }

        LambdaQueryWrapper<OperationLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(OperationLog::getContainerId, id)
                .orderByDesc(OperationLog::getCreateTime);
        List<OperationLog> logs = operationLogMapper.selectList(logWrapper);
        vo.setHistory(logs);

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateContainerSlot(Long containerId, Long slotId) {
        Container container = containerMapper.selectById(containerId);
        if (container == null) {
            return false;
        }

        Container before = new Container();
        BeanUtils.copyProperties(container, before);

        YardSlot slot = yardSlotMapper.selectById(slotId);
        if (slot != null) {
            container.setYardId(slot.getYardId());
            container.setSlotId(slotId);
            container.setPosition(slot.getSlotCode());
        }

        int result = containerMapper.updateById(container);
        if (result > 0) {
            operationLogService.logOperation("集装箱管理", "更新箱位", containerId, container.getContainerNo(),
                    before, container, null, null, null);

            if (container.getYardId() != null) {
                yardService.updateYardSlotCount(container.getYardId());
            }
        }
        return result > 0;
    }
}
