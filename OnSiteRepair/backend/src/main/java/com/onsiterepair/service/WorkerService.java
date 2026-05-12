package com.onsiterepair.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.onsiterepair.dto.LoginDTO;
import com.onsiterepair.dto.RegisterDTO;
import com.onsiterepair.entity.Worker;
import com.onsiterepair.vo.LoginVO;

import java.math.BigDecimal;
import java.util.List;

public interface WorkerService extends IService<Worker> {
    LoginVO login(LoginDTO dto);
    LoginVO register(RegisterDTO dto);
    Worker getByPhone(String phone);
    List<Worker> findNearbyWorkers(BigDecimal latitude, BigDecimal longitude, String category, Double radius);
    Worker updateLocation(Long workerId, BigDecimal latitude, BigDecimal longitude, String address);
}
