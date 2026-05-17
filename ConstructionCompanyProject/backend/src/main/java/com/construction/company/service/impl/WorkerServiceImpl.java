package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Worker;
import com.construction.company.mapper.WorkerMapper;
import com.construction.company.service.WorkerService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkerServiceImpl extends ServiceImpl<WorkerMapper, Worker> implements WorkerService {

    @Override
    public boolean save(Worker worker) {
        return super.save(worker);
    }

    @Override
    public boolean updateById(Worker worker) {
        return super.updateById(worker);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Worker getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Worker> list() {
        return super.list();
    }
}
