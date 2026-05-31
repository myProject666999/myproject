package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.entity.Crane;
import com.port.container.vo.CraneLoadInfoVO;

import java.util.List;

public interface CraneService extends IService<Crane> {

    Crane getById(Long id);

    List<Crane> list();

    IPage<Crane> page(Long current, Long size);

    boolean save(Crane crane);

    boolean update(Crane crane);

    boolean remove(Long id);

    List<Crane> getAvailableCranes(Long yardId);

    List<CraneLoadInfoVO> getCraneLoadInfo();

    boolean updateCraneStatus(Long craneId, Integer status, Long operatorId, String operatorName);

    boolean updateCranePosition(Long craneId, Integer currentRow, Integer currentBay);

    boolean incrementOperationCount(Long craneId);
}
