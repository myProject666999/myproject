package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.dto.ContainerInDTO;
import com.port.container.dto.ContainerOutDTO;
import com.port.container.dto.ContainerQueryDTO;
import com.port.container.entity.Container;
import com.port.container.vo.ContainerDetailVO;

import java.util.List;

public interface ContainerService extends IService<Container> {

    Container getById(Long id);

    List<Container> list();

    IPage<Container> page(Long current, Long size);

    boolean save(Container container);

    boolean update(Container container);

    boolean remove(Long id);

    Container getByContainerNo(String containerNo);

    Container registerInbound(ContainerInDTO dto);

    Container registerOutbound(ContainerOutDTO dto);

    IPage<Container> getInYardContainers(ContainerQueryDTO dto);

    ContainerDetailVO getContainerDetail(Long id);

    boolean updateContainerSlot(Long containerId, Long slotId);
}
