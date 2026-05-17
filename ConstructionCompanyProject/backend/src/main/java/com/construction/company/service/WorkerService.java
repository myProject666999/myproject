package com.construction.company.service;

import com.construction.company.entity.Worker;

import java.util.List;

public interface WorkerService {
    boolean save(Worker worker);
    boolean updateById(Worker worker);
    boolean removeById(Long id);
    Worker getById(Long id);
    List<Worker> list();
}
