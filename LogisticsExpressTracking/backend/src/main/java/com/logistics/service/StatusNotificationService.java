package com.logistics.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.logistics.entity.StatusNotification;

import java.util.List;

public interface StatusNotificationService extends IService<StatusNotification> {

    boolean createNotification(Long waybillId, String waybillNo, Integer oldStatus, Integer newStatus);

    List<StatusNotification> getNotificationsByWaybillNo(String waybillNo);

    boolean markAsRead(Long id);
}
