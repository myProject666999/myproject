package com.logistics.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.logistics.dto.TrackingNodeCreateDTO;
import com.logistics.entity.TrackingNode;

import java.util.List;

public interface TrackingNodeService extends IService<TrackingNode> {

    boolean addTrackingNode(TrackingNodeCreateDTO dto);

    List<TrackingNode> getTrackingNodesByWaybillNo(String waybillNo);

    List<TrackingNode> getTrackingNodesByWaybillId(Long waybillId);
}
