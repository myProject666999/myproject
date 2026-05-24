package com.logistics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logistics.dto.WaybillCreateDTO;
import com.logistics.dto.WaybillQueryDTO;
import com.logistics.entity.TrackingNode;
import com.logistics.entity.Waybill;
import com.logistics.mapper.WaybillMapper;
import com.logistics.service.StatusNotificationService;
import com.logistics.service.TrackingNodeService;
import com.logistics.service.WaybillService;
import com.logistics.vo.TrackingNodeVO;
import com.logistics.vo.WaybillDetailVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class WaybillServiceImpl extends ServiceImpl<WaybillMapper, Waybill> implements WaybillService {

    @Autowired
    private TrackingNodeService trackingNodeService;

    @Autowired
    private StatusNotificationService statusNotificationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createWaybill(WaybillCreateDTO dto) {
        Waybill waybill = new Waybill();
        BeanUtils.copyProperties(dto, waybill);
        waybill.setWaybillNo(generateWaybillNo());
        waybill.setStatus(0);
        this.save(waybill);
        return waybill.getWaybillNo();
    }

    @Override
    @Cacheable(value = "waybill", key = "#waybillNo", unless = "#result == null")
    public WaybillDetailVO getWaybillDetail(String waybillNo) {
        Waybill waybill = baseMapper.selectByWaybillNo(waybillNo);
        if (waybill == null) {
            return null;
        }

        WaybillDetailVO vo = new WaybillDetailVO();
        BeanUtils.copyProperties(waybill, vo);
        vo.setStatusText(getStatusText(waybill.getStatus()));

        List<TrackingNode> nodes = trackingNodeService.getTrackingNodesByWaybillId(waybill.getId());
        List<TrackingNodeVO> nodeVOs = nodes.stream().map(node -> {
            TrackingNodeVO nodeVO = new TrackingNodeVO();
            BeanUtils.copyProperties(node, nodeVO);
            nodeVO.setNodeTypeText(getNodeTypeText(node.getNodeType()));
            return nodeVO;
        }).collect(Collectors.toList());
        vo.setTrackingNodes(nodeVOs);

        return vo;
    }

    @Override
    public IPage<Waybill> queryWaybills(WaybillQueryDTO dto) {
        Page<Waybill> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        LambdaQueryWrapper<Waybill> wrapper = new LambdaQueryWrapper<>();

        if (dto.getWaybillNo() != null && !dto.getWaybillNo().isEmpty()) {
            wrapper.like(Waybill::getWaybillNo, dto.getWaybillNo());
        }
        if (dto.getSenderPhone() != null && !dto.getSenderPhone().isEmpty()) {
            wrapper.eq(Waybill::getSenderPhone, dto.getSenderPhone());
        }
        if (dto.getReceiverPhone() != null && !dto.getReceiverPhone().isEmpty()) {
            wrapper.eq(Waybill::getReceiverPhone, dto.getReceiverPhone());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(Waybill::getStatus, dto.getStatus());
        }
        wrapper.orderByDesc(Waybill::getCreateTime);

        return this.page(page, wrapper);
    }

    @Override
    @CacheEvict(value = "waybill", allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public boolean updateWaybillStatus(Long id, Integer status) {
        Waybill waybill = this.getById(id);
        if (waybill == null) {
            return false;
        }
        Integer oldStatus = waybill.getStatus();
        waybill.setStatus(status);
        boolean result = this.updateById(waybill);

        if (result && !oldStatus.equals(status)) {
            statusNotificationService.createNotification(
                    waybill.getId(),
                    waybill.getWaybillNo(),
                    oldStatus,
                    status
            );
        }
        return result;
    }

    @Override
    @CacheEvict(value = "waybill", allEntries = true)
    public boolean updateWaybill(Waybill waybill) {
        return this.updateById(waybill);
    }

    private String generateWaybillNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        Random random = new Random();
        int randomNum = random.nextInt(900) + 100;
        return "YB" + dateStr + randomNum;
    }

    private String getStatusText(Integer status) {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "待揽件";
            case 1: return "运输中";
            case 2: return "派送中";
            case 3: return "已签收";
            case 4: return "已退回";
            case 5: return "异常";
            default: return "未知";
        }
    }

    private String getNodeTypeText(Integer nodeType) {
        if (nodeType == null) return "未知";
        switch (nodeType) {
            case 1: return "揽件";
            case 2: return "运输";
            case 3: return "中转";
            case 4: return "派送";
            case 5: return "签收";
            case 6: return "退回";
            case 7: return "异常";
            default: return "未知";
        }
    }
}
