package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.entity.Yard;
import com.port.container.vo.YardOverviewVO;

import java.util.List;

public interface YardService extends IService<Yard> {

    Yard getById(Long id);

    List<Yard> list();

    IPage<Yard> page(Long current, Long size);

    boolean save(Yard yard);

    boolean update(Yard yard);

    boolean remove(Long id);

    YardOverviewVO getYardOverview(Long yardId);

    List<YardOverviewVO> getAllYardOverviews();

    boolean updateYardSlotCount(Long yardId);
}
