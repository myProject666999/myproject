package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.entity.Crane;
import com.port.container.entity.Task;
import com.port.container.mapper.CraneMapper;
import com.port.container.mapper.TaskMapper;
import com.port.container.service.CraneService;
import com.port.container.service.OperationLogService;
import com.port.container.vo.CraneLoadInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CraneServiceImpl extends ServiceImpl<CraneMapper, Crane> implements CraneService {

    @Autowired
    private CraneMapper craneMapper;

    @Autowired
    private TaskMapper taskMapper;

    @Autowired
    private OperationLogService operationLogService;

    private static final int CRANE_STATUS_IDLE = 1;
    private static final int CRANE_STATUS_WORKING = 2;
    private static final int CRANE_STATUS_MAINTENANCE = 3;
    private static final int CRANE_STATUS_FAULT = 4;

    private static final int TASK_STATUS_PENDING = 1;
    private static final int TASK_STATUS_ASSIGNED = 2;
    private static final int TASK_STATUS_WORKING = 3;
    private static final int TASK_STATUS_COMPLETED = 4;

    @Override
    public Crane getById(Long id) {
        return craneMapper.selectById(id);
    }

    @Override
    public List<Crane> list() {
        return craneMapper.selectList(null);
    }

    @Override
    public IPage<Crane> page(Long current, Long size) {
        Page<Crane> page = new Page<>(current, size);
        return craneMapper.selectPage(page, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(Crane crane) {
        Crane before = null;
        int result = craneMapper.insert(crane);
        operationLogService.logOperation("吊机管理", "新增", crane.getId(), crane.getCraneCode(),
                before, crane, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(Crane crane) {
        Crane before = craneMapper.selectById(crane.getId());
        int result = craneMapper.updateById(crane);
        operationLogService.logOperation("吊机管理", "修改", crane.getId(), crane.getCraneCode(),
                before, crane, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        Crane before = craneMapper.selectById(id);
        int result = craneMapper.deleteById(id);
        if (before != null) {
            operationLogService.logOperation("吊机管理", "删除", id, before.getCraneCode(),
                    before, null, null, null, null);
        }
        return result > 0;
    }

    @Override
    public List<Crane> getAvailableCranes(Long yardId) {
        LambdaQueryWrapper<Crane> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Crane::getStatus, CRANE_STATUS_IDLE);
        if (yardId != null) {
            wrapper.eq(Crane::getYardId, yardId);
        }
        wrapper.orderByAsc(Crane::getCraneCode);
        return craneMapper.selectList(wrapper);
    }

    @Override
    public List<CraneLoadInfoVO> getCraneLoadInfo() {
        List<Crane> cranes = craneMapper.selectList(null);
        List<Long> craneIds = cranes.stream().map(Crane::getId).collect(Collectors.toList());

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();

        LambdaQueryWrapper<Task> taskWrapper = new LambdaQueryWrapper<>();
        taskWrapper.in(Task::getCraneId, craneIds);
        List<Task> allTasks = taskMapper.selectList(taskWrapper);

        Map<Long, List<Task>> taskMap = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getCraneId));

        LambdaQueryWrapper<Task> todayTaskWrapper = new LambdaQueryWrapper<>();
        todayTaskWrapper.in(Task::getCraneId, craneIds)
                .eq(Task::getStatus, TASK_STATUS_COMPLETED)
                .ge(Task::getCompleteTime, todayStart)
                .lt(Task::getCompleteTime, tomorrowStart);
        List<Task> todayCompletedTasks = taskMapper.selectList(todayTaskWrapper);

        Map<Long, Long> todayCompletedMap = todayCompletedTasks.stream()
                .collect(Collectors.groupingBy(Task::getCraneId, Collectors.counting()));

        List<CraneLoadInfoVO> result = new ArrayList<>();
        for (Crane crane : cranes) {
            CraneLoadInfoVO vo = new CraneLoadInfoVO();
            vo.setCraneId(crane.getId());
            vo.setCraneCode(crane.getCraneCode());
            vo.setCraneName(crane.getCraneName());
            vo.setStatus(crane.getStatus());
            vo.setStatusName(getStatusName(crane.getStatus()));
            vo.setMaxLoad(crane.getMaxLoad());
            vo.setOperator(crane.getOperator());
            vo.setCurrentPosition(crane.getCurrentPosition());

            List<Task> craneTasks = taskMap.getOrDefault(crane.getId(), new ArrayList<>());
            int pendingTasks = (int) craneTasks.stream()
                    .filter(t -> t.getStatus() == TASK_STATUS_PENDING
                            || t.getStatus() == TASK_STATUS_ASSIGNED
                            || t.getStatus() == TASK_STATUS_WORKING)
                    .count();
            vo.setPendingTasks(pendingTasks);

            long completedToday = todayCompletedMap.getOrDefault(crane.getId(), 0L);
            vo.setCompletedTasksToday((int) completedToday);

            if (crane.getMaxLoad() != null && crane.getMaxLoad().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal estimatedLoad = BigDecimal.valueOf(pendingTasks * 20);
                if (estimatedLoad.compareTo(crane.getMaxLoad()) > 0) {
                    estimatedLoad = crane.getMaxLoad();
                }
                vo.setCurrentLoad(estimatedLoad);
                vo.setLoadRate(estimatedLoad.divide(crane.getMaxLoad(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)));
            } else {
                vo.setCurrentLoad(BigDecimal.ZERO);
                vo.setLoadRate(BigDecimal.ZERO);
            }

            result.add(vo);
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateCraneStatus(Long craneId, Integer status, Long operatorId, String operatorName) {
        Crane before = craneMapper.selectById(craneId);
        if (before == null) {
            return false;
        }

        Crane beforeCopy = new Crane();
        beforeCopy.setStatus(before.getStatus());
        beforeCopy.setOperator(before.getOperator());

        LambdaUpdateWrapper<Crane> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Crane::getId, craneId)
                .set(Crane::getStatus, status);
        if (operatorName != null) {
            wrapper.set(Crane::getOperator, operatorName);
        }

        int result = craneMapper.update(null, wrapper);
        if (result > 0) {
            Crane after = new Crane();
            after.setStatus(status);
            after.setOperator(operatorName);
            operationLogService.logOperation("吊机管理", "更新状态", craneId, before.getCraneCode(),
                    beforeCopy, after, operatorId, operatorName, null);
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateCranePosition(Long craneId, Integer currentRow, Integer currentBay) {
        Crane before = craneMapper.selectById(craneId);
        if (before == null) {
            return false;
        }

        Crane beforeCopy = new Crane();
        beforeCopy.setCurrentPosition(before.getCurrentPosition());
        beforeCopy.setCurrentX(before.getCurrentX());
        beforeCopy.setCurrentY(before.getCurrentY());

        String position = currentRow + "-" + currentBay;
        LambdaUpdateWrapper<Crane> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Crane::getId, craneId)
                .set(Crane::getCurrentPosition, position);
        if (currentRow != null) {
            wrapper.set(Crane::getCurrentX, BigDecimal.valueOf(currentRow));
        }
        if (currentBay != null) {
            wrapper.set(Crane::getCurrentY, BigDecimal.valueOf(currentBay));
        }

        int result = craneMapper.update(null, wrapper);
        if (result > 0) {
            Crane after = new Crane();
            after.setCurrentPosition(position);
            after.setCurrentX(currentRow != null ? BigDecimal.valueOf(currentRow) : null);
            after.setCurrentY(currentBay != null ? BigDecimal.valueOf(currentBay) : null);
            operationLogService.logOperation("吊机管理", "更新位置", craneId, before.getCraneCode(),
                    beforeCopy, after, null, null, null);
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean incrementOperationCount(Long craneId) {
        Crane crane = craneMapper.selectById(craneId);
        if (crane == null) {
            return false;
        }

        operationLogService.logOperation("吊机管理", "增加作业计数", craneId, crane.getCraneCode(),
                null, 1, null, null, null);
        return true;
    }

    private String getStatusName(Integer status) {
        if (status == null) {
            return "未知";
        }
        switch (status) {
            case CRANE_STATUS_IDLE:
                return "空闲";
            case CRANE_STATUS_WORKING:
                return "作业中";
            case CRANE_STATUS_MAINTENANCE:
                return "维护中";
            case CRANE_STATUS_FAULT:
                return "故障";
            default:
                return "未知";
        }
    }
}
