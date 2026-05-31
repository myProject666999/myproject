package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.aspect.OperationLog;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.dto.TaskAssignDTO;
import com.port.container.dto.TaskCreateDTO;
import com.port.container.entity.Task;
import com.port.container.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/task")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/list")
    public R<PageResult<Task>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String taskNo,
            @RequestParam(required = false) String taskType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) Long craneId,
            @RequestParam(required = false) String containerNo,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime plannedStartTimeStart,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime plannedStartTimeEnd) {
        IPage<Task> page = taskService.page(current != null ? current : 1L, size != null ? size : 10L);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<Task> getById(@PathVariable Long id) {
        return R.success(taskService.getById(id));
    }

    @GetMapping("/pending")
    public R<List<Task>> getPendingTasks() {
        return R.success(taskService.getPendingTasks());
    }

    @GetMapping("/by-crane/{craneId}")
    public R<List<Task>> getTasksByCrane(@PathVariable Long craneId, @RequestParam(required = false) Integer status) {
        return R.success(taskService.getTasksByCrane(craneId, status));
    }

    @GetMapping("/queue/{craneId}")
    public R<List<Task>> getTaskQueue(@PathVariable Long craneId) {
        return R.success(taskService.getTaskQueue(craneId));
    }

    @PostMapping("/create")
    @OperationLog(module = "任务管理", operationType = "创建", description = "创建任务")
    public R<Task> create(@Valid @RequestBody TaskCreateDTO dto) {
        Task task = taskService.createTask(dto);
        return task != null ? R.success(task) : R.fail();
    }

    @PostMapping("/assign")
    @OperationLog(module = "任务管理", operationType = "分配", description = "分配任务")
    public R<Void> assign(@Valid @RequestBody TaskAssignDTO dto) {
        boolean result = taskService.assignTask(dto);
        return result ? R.success() : R.fail();
    }

    @PostMapping("/start/{taskId}")
    @OperationLog(module = "任务管理", operationType = "开始", description = "开始任务")
    public R<Void> start(@PathVariable Long taskId, @RequestBody Map<String, Long> params) {
        Long operatorId = params.get("operatorId");
        boolean result = taskService.startTask(taskId, operatorId);
        return result ? R.success() : R.fail();
    }

    @PostMapping("/complete/{taskId}")
    @OperationLog(module = "任务管理", operationType = "完成", description = "完成任务")
    public R<Void> complete(@PathVariable Long taskId, @RequestBody Map<String, Long> params) {
        Long operatorId = params.get("operatorId");
        boolean result = taskService.completeTask(taskId, operatorId);
        return result ? R.success() : R.fail();
    }

    @PostMapping("/cancel/{taskId}")
    @OperationLog(module = "任务管理", operationType = "取消", description = "取消任务")
    public R<Void> cancel(@PathVariable Long taskId, @RequestBody Map<String, Object> params) {
        String reason = params.get("reason") != null ? params.get("reason").toString() : null;
        Long operatorId = params.get("operatorId") != null ? Long.valueOf(params.get("operatorId").toString()) : null;
        boolean result = taskService.cancelTask(taskId, reason, operatorId);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/update")
    @OperationLog(module = "任务管理", operationType = "修改", description = "修改任务")
    public R<Void> update(@Valid @RequestBody Task task) {
        boolean result = taskService.update(task);
        return result ? R.success() : R.fail();
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "任务管理", operationType = "删除", description = "删除任务")
    public R<Void> delete(@PathVariable Long id) {
        boolean result = taskService.remove(id);
        return result ? R.success() : R.fail();
    }
}
