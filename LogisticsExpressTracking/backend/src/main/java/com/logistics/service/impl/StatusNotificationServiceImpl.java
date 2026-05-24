package com.logistics.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.logistics.entity.StatusNotification;
import com.logistics.entity.Waybill;
import com.logistics.mapper.StatusNotificationMapper;
import com.logistics.service.StatusNotificationService;
import com.logistics.service.WaybillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatusNotificationServiceImpl extends ServiceImpl<StatusNotificationMapper, StatusNotification> implements StatusNotificationService {

    @Autowired
    private WaybillService waybillService;

    @Override
    public boolean createNotification(Long waybillId, String waybillNo, Integer oldStatus, Integer newStatus) {
        StatusNotification notification = new StatusNotification();
        notification.setWaybillId(waybillId);
        notification.setWaybillNo(waybillNo);
        notification.setOldStatus(oldStatus);
        notification.setNewStatus(newStatus);
        notification.setNotifyType(3);
        notification.setIsRead(0);

        Waybill waybill = waybillService.getById(waybillId);
        if (waybill != null) {
            notification.setNotifyTarget(waybill.getReceiverPhone());
            notification.setNotifyContent(
                    String.format("运单号:%s 状态由【%s】变更为【%s】",
                            waybillNo,
                            getStatusText(oldStatus),
                            getStatusText(newStatus))
            );
        } else {
            notification.setNotifyContent(
                    String.format("运单号:%s 状态变更", waybillNo)
            );
        }

        return this.save(notification);
    }

    @Override
    public List<StatusNotification> getNotificationsByWaybillNo(String waybillNo) {
        return baseMapper.selectByWaybillNo(waybillNo);
    }

    @Override
    public boolean markAsRead(Long id) {
        return baseMapper.markAsRead(id) > 0;
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
}
