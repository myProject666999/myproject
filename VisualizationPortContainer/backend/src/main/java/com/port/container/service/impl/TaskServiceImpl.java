package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.dto.TaskAssignDTO;
import com.port.container.dto.TaskCreateDTO;
import com.port.container.entity.Container;
import com.port.container.entity.Crane;
import com.port.container.entity.Task;
import com.port.container.mapper.ContainerMapper;
import com.port.container.mapper.CraneMapper;
import com.port.container.mapper.TaskMapper;
import com.port.container.service.CraneService;
import com.port.container.service.OperationLogService;
import com.port.container.service.TaskService;
import com.port.container.service.YardSlotService;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {

    @Autowired
    private TaskMapper taskMapper;

    @Autowired
    private CraneMapper craneMapper;

    @Autowired
    private ContainerMapper containerMapper;

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private CraneService craneService;

    @Autowired
    private YardSlotService yardSlotService;

    @Autowired
    private RedissonClient redissonClient;

    private static final String TASK_LOCK_PREFIX = "yard:task:lock:";
    private static final String TASK_NO_PREFIX = "TASK";

    private static final int TASK_STATUS_PENDING = 1;
    private static final int TASK_STATUS_ASSIGNED = 2;
    private static final int TASK_STATUS_WORKING = 3;
    private static final int TASK_STATUS_COMPLETED = 4;
    private static final int TASK_STATUS_CANCELLED = 5;

    private static final int CRANE_STATUS_IDLE = 1;
    private static final int CRANE_STATUS_WORKING = 2;

    @Override
    public Task getById(Long id) {
        return taskMapper.selectById(id);
    }

    @Override
    public List<Task> list() {
        return taskMapper.selectList(null);
    }

    @Override
    public IPage<Task> page(Long current, Long size) {
        Page<Task> page = new Page<>(current, size);
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Task::getPriority)
                .orderByAsc(Task::getCreateTime);
        return taskMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(Task task) {
        Task before = null;
        int result = taskMapper.insert(task);
        operationLogService.logOperation("任务管理", "新增", task.getId(), task.getTaskNo(),
                before, task, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(Task task) {
        Task before = taskMapper.selectById(task.getId());
        int result = taskMapper.updateById(task);
        operationLogService.logOperation("任务管理", "修改", task.getId(), task.getTaskNo(),
                before, task, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        Task before = taskMapper.selectById(id);
        int result = taskMapper.deleteById(id);
        if (before != null) {
            operationLogService.logOperation("任务管理", "删除", id, before.getTaskNo(),
                    before, null, null, null, null);
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Task createTask(TaskCreateDTO dto) {
        Task task = new Task();
        BeanUtils.copyProperties(dto, task);
        task.setTaskNo(generateTaskNo());
        task.setStatus(TASK_STATUS_PENDING);
        task.setProgress(0);

        if (dto.getPriority() == null) {
            task.setPriority(5);
        }

        if (dto.getContainerId() != null) {
            Container container = containerMapper.selectById(dto.getContainerId());
            if (container != null) {
                task.setContainerNo(container.getContainerNo());
            }
        }

        taskMapper.insert(task);

        operationLogService.logOperation("任务管理", "创建任务", task.getId(), task.getTaskNo(),
                null, task, dto.getOperatorId(), dto.getOperatorName(), null);

        return task;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignTask(TaskAssignDTO dto) {
        String lockKey = TASK_LOCK_PREFIX + dto.getTaskId();
        RLock lock = redissonClient.getLock(lockKey);
        try {
            if (!lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                throw new RuntimeException("任务正在被其他操作处理，请稍后再试");
            }
            try {
                Task task = taskMapper.selectById(dto.getTaskId());
                if (task == null) {
                    throw new RuntimeException("任务不存在");
                }
                if (task.getStatus() != TASK_STATUS_PENDING) {
                    throw new RuntimeException("任务状态不允许分配");
                }

                Crane crane = craneMapper.selectById(dto.getCraneId());
                if (crane == null) {
                    throw new RuntimeException("吊机不存在");
                }
                if (crane.getStatus() != CRANE_STATUS_IDLE) {
                    throw new RuntimeException("吊机状态不空闲");
                }

                LambdaQueryWrapper<Task> conflictWrapper = new LambdaQueryWrapper<>();
                conflictWrapper.eq(Task::getCraneId, dto.getCraneId())
                        .in(Task::getStatus, TASK_STATUS_ASSIGNED, TASK_STATUS_WORKING);
                List<Task> existingTasks = taskMapper.selectList(conflictWrapper);

                if (detectConflict(task, existingTasks)) {
                    throw new RuntimeException("存在任务冲突，无法分配");
                }

                Task before = new Task();
                BeanUtils.copyProperties(task, before);

                LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
                wrapper.eq(Task::getId, dto.getTaskId())
                        .eq(Task::getStatus, TASK_STATUS_PENDING)
                        .set(Task::getStatus, TASK_STATUS_ASSIGNED)
                        .set(Task::getCraneId, dto.getCraneId())
                        .set(Task::getCraneCode, crane.getCraneCode())
                        .set(Task::getOperatorId, dto.getOperatorId())
                        .set(Task::getOperatorName, dto.getOperatorName())
                        .set(Task::getAssignTime, LocalDateTime.now());

                int result = taskMapper.update(null, wrapper);
                if (result > 0) {
                    craneService.updateCraneStatus(dto.getCraneId(), CRANE_STATUS_WORKING,
                            dto.getOperatorId(), dto.getOperatorName());

                    operationLogService.logOperation("任务管理", "分配任务", dto.getTaskId(), task.getTaskNo(),
                            before, task, dto.getOperatorId(), dto.getOperatorName(), null);
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
    public boolean startTask(Long taskId, Long operatorId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            return false;
        }
        if (task.getStatus() != TASK_STATUS_ASSIGNED) {
            return false;
        }

        Task before = new Task();
        BeanUtils.copyProperties(task, before);

        LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Task::getId, taskId)
                .eq(Task::getStatus, TASK_STATUS_ASSIGNED)
                .set(Task::getStatus, TASK_STATUS_WORKING)
                .set(Task::getStartTime, LocalDateTime.now())
                .set(Task::getProgress, 0);

        int result = taskMapper.update(null, wrapper);
        if (result > 0) {
            operationLogService.logOperation("任务管理", "开始任务", taskId, task.getTaskNo(),
                    before, task, operatorId, null, null);
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeTask(Long taskId, Long operatorId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            return false;
        }
        if (task.getStatus() != TASK_STATUS_WORKING) {
            return false;
        }

        Task before = new Task();
        BeanUtils.copyProperties(task, before);

        LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Task::getId, taskId)
                .eq(Task::getStatus, TASK_STATUS_WORKING)
                .set(Task::getStatus, TASK_STATUS_COMPLETED)
                .set(Task::getCompleteTime, LocalDateTime.now())
                .set(Task::getProgress, 100);

        int result = taskMapper.update(null, wrapper);
        if (result > 0) {
            if (task.getCraneId() != null) {
                craneService.updateCraneStatus(task.getCraneId(), CRANE_STATUS_IDLE, operatorId, null);
                craneService.incrementOperationCount(task.getCraneId());
            }

            if (task.getTargetSlotId() != null && task.getContainerId() != null) {
                yardSlotService.occupySlot(task.getTargetSlotId(), task.getContainerId());
            }

            operationLogService.logOperation("任务管理", "完成任务", taskId, task.getTaskNo(),
                    before, task, operatorId, null, null);
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelTask(Long taskId, String reason, Long operatorId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            return false;
        }
        if (task.getStatus() == TASK_STATUS_COMPLETED || task.getStatus() == TASK_STATUS_CANCELLED) {
            return false;
        }

        Task before = new Task();
        BeanUtils.copyProperties(task, before);

        LambdaUpdateWrapper<Task> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Task::getId, taskId)
                .notIn(Task::getStatus, TASK_STATUS_COMPLETED, TASK_STATUS_CANCELLED)
                .set(Task::getStatus, TASK_STATUS_CANCELLED)
                .set(Task::getRemark, reason);

        int result = taskMapper.update(null, wrapper);
        if (result > 0) {
            if (task.getCraneId() != null
                    && (task.getStatus() == TASK_STATUS_ASSIGNED || task.getStatus() == TASK_STATUS_WORKING)) {
                craneService.updateCraneStatus(task.getCraneId(), CRANE_STATUS_IDLE, operatorId, null);
            }

            operationLogService.logOperation("任务管理", "取消任务", taskId, task.getTaskNo(),
                    before, task, operatorId, null, null);
        }
        return result > 0;
    }

    @Override
    public List<Task> getPendingTasks() {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getStatus, TASK_STATUS_PENDING)
                .orderByDesc(Task::getPriority)
                .orderByAsc(Task::getCreateTime);
        return taskMapper.selectList(wrapper);
    }

    @Override
    public List<Task> getTasksByCrane(Long craneId, Integer status) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getCraneId, craneId);
        if (status != null) {
            wrapper.eq(Task::getStatus, status);
        }
        wrapper.orderByDesc(Task::getPriority)
                .orderByAsc(Task::getCreateTime);
        return taskMapper.selectList(wrapper);
    }

    @Override
    public boolean detectConflict(Task task, List<Task> existingTasks) {
        if (existingTasks == null || existingTasks.isEmpty()) {
            return false;
        }

        for (Task existing : existingTasks) {
            if (existing.getId().equals(task.getId())) {
                continue;
            }

            if (task.getSourceSlotId() != null
                    && existing.getSourceSlotId() != null
                    && task.getSourceSlotId().equals(existing.getSourceSlotId())) {
                return true;
            }

            if (task.getTargetSlotId() != null
                    && existing.getTargetSlotId() != null
                    && task.getTargetSlotId().equals(existing.getTargetSlotId())) {
                return true;
            }

            if (task.getContainerId() != null
                    && existing.getContainerId() != null
                    && task.getContainerId().equals(existing.getContainerId())) {
                return true;
            }
        }

        return false;
    }

    @Override
    public List<Task> getTaskQueue(Long craneId) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getCraneId, craneId)
                .in(Task::getStatus, TASK_STATUS_ASSIGNED, TASK_STATUS_WORKING)
                .orderByDesc(Task::getPriority)
                .orderByAsc(Task::getAssignTime);
        return taskMapper.selectList(wrapper);
    }

    private String generateTaskNo() {
        return TASK_NO_PREFIX + System.currentTimeMillis();
    }
}
