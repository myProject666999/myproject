package com.logistics.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logistics.dto.TrackingNodeCreateDTO;
import com.logistics.entity.TrackingNode;
import com.logistics.entity.Waybill;
import com.logistics.mapper.TrackingNodeMapper;
import com.logistics.service.TrackingNodeService;
import com.logistics.service.WaybillService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrackingNodeServiceImpl extends ServiceImpl<TrackingNodeMapper, TrackingNode> implements TrackingNodeService {

    @Autowired
    private WaybillService waybillService;

    @Override
    @CacheEvict(value = "waybill", allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public boolean addTrackingNode(TrackingNodeCreateDTO dto) {
        TrackingNode node = new TrackingNode();
        BeanUtils.copyProperties(dto, node);
        node.setNodeTime(LocalDateTime.now());
        boolean result = this.save(node);

        if (result && dto.getNodeType() != null) {
            Waybill waybill = waybillService.getById(dto.getWaybillId());
            if (waybill != null) {
                Integer newStatus = mapNodeTypeToStatus(dto.getNodeType());
                if (newStatus != null && !newStatus.equals(waybill.getStatus())) {
                    waybillService.updateWaybillStatus(dto.getWaybillId(), newStatus);
                }
            }
        }
        return result;
    }

    @Override
    public List<TrackingNode> getTrackingNodesByWaybillNo(String waybillNo) {
        return baseMapper.selectByWaybillNo(waybillNo);
    }

    @Override
    public List<TrackingNode> getTrackingNodesByWaybillId(Long waybillId) {
        return baseMapper.selectByWaybillId(waybillId);
    }

    private Integer mapNodeTypeToStatus(Integer nodeType) {
        switch (nodeType) {
            case 1: return 1;
            case 2:
            case 3: return 1;
            case 4: return 2;
            case 5: return 3;
            case 6: return 4;
            case 7: return 5;
            default: return null;
        }
    }
}
