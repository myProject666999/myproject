package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.dto.TaskAssignDTO;
import com.port.container.dto.TaskCreateDTO;
import com.port.container.entity.Task;

import java.util.List;

public interface TaskService extends IService<Task> {

    Task getById(Long id);

    List<Task> list();

    IPage<Task> page(Long current, Long size);

    boolean save(Task task);

    boolean update(Task task);

    boolean remove(Long id);

    Task createTask(TaskCreateDTO dto);

    boolean assignTask(TaskAssignDTO dto);

    boolean startTask(Long taskId, Long operatorId);

    boolean completeTask(Long taskId, Long operatorId);

    boolean cancelTask(Long taskId, String reason, Long operatorId);

    List<Task> getPendingTasks();

    List<Task> getTasksByCrane(Long craneId, Integer status);

    boolean detectConflict(Task task, List<Task> existingTasks);

    List<Task> getTaskQueue(Long craneId);
}
