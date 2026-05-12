package com.onsiterepair.service.impl;

import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.onsiterepair.dto.LoginDTO;
import com.onsiterepair.dto.RegisterDTO;
import com.onsiterepair.entity.Worker;
import com.onsiterepair.exception.BusinessException;
import com.onsiterepair.mapper.WorkerMapper;
import com.onsiterepair.service.WorkerService;
import com.onsiterepair.utils.JwtUtils;
import com.onsiterepair.utils.MapUtils;
import com.onsiterepair.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerServiceImpl extends ServiceImpl<WorkerMapper, Worker> implements WorkerService {

    private final JwtUtils jwtUtils;
    private final MapUtils mapUtils;

    @Override
    public LoginVO login(LoginDTO dto) {
        Worker worker = getByPhone(dto.getPhone());
        if (worker == null) {
            throw new BusinessException("师傅不存在");
        }
        if (worker.getStatus() == 0) {
            throw new BusinessException("账号待审核");
        }
        if (worker.getStatus() == 2) {
            throw new BusinessException("审核未通过");
        }
        if (worker.getStatus() == 3) {
            throw new BusinessException("账号已被禁用");
        }
        if (!BCrypt.checkpw(dto.getPassword(), worker.getPassword())) {
            throw new BusinessException("密码错误");
        }
        return buildLoginVO(worker);
    }

    @Override
    public LoginVO register(RegisterDTO dto) {
        Worker existWorker = getByPhone(dto.getPhone());
        if (existWorker != null) {
            throw new BusinessException("手机号已注册");
        }
        Worker worker = new Worker();
        worker.setPhone(dto.getPhone());
        worker.setPassword(BCrypt.hashpw(dto.getPassword()));
        worker.setNickname(dto.getNickname() != null ? dto.getNickname() : "师傅" + dto.getPhone().substring(7));
        worker.setRating(BigDecimal.valueOf(5.00));
        worker.setOrderCount(0);
        worker.setStatus(0);
        save(worker);
        return buildLoginVO(worker);
    }

    @Override
    public Worker getByPhone(String phone) {
        return getOne(new LambdaQueryWrapper<Worker>().eq(Worker::getPhone, phone));
    }

    @Override
    public List<Worker> findNearbyWorkers(BigDecimal latitude, BigDecimal longitude, String category, Double radius) {
        List<Worker> workers = list(new LambdaQueryWrapper<Worker>()
                .eq(Worker::getStatus, 1)
                .orderByDesc(Worker::getRating));

        return workers.stream()
                .filter(w -> w.getLatitude() != null && w.getLongitude() != null)
                .filter(w -> {
                    BigDecimal distance = mapUtils.calculateDistance(latitude, longitude, w.getLatitude(), w.getLongitude());
                    return distance != null && distance.doubleValue() <= radius;
                })
                .sorted(Comparator.comparing(w -> mapUtils.calculateDistance(latitude, longitude, w.getLatitude(), w.getLongitude())))
                .collect(Collectors.toList());
    }

    @Override
    public Worker updateLocation(Long workerId, BigDecimal latitude, BigDecimal longitude, String address) {
        Worker worker = getById(workerId);
        if (worker == null) {
            throw new BusinessException("师傅不存在");
        }
        worker.setLatitude(latitude);
        worker.setLongitude(longitude);
        if (address != null) {
            worker.setAddress(address);
        }
        updateById(worker);
        return worker;
    }

    private LoginVO buildLoginVO(Worker worker) {
        LoginVO vo = new LoginVO();
        vo.setId(worker.getId());
        vo.setPhone(worker.getPhone());
        vo.setNickname(worker.getNickname());
        vo.setAvatar(worker.getAvatar());
        vo.setToken(jwtUtils.generateToken(worker.getId(), 2));
        vo.setUserType(2);
        return vo;
    }
}
