package com.logistics.controller;

import com.logistics.entity.StatusNotification;
import com.logistics.service.StatusNotificationService;
import com.logistics.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
public class StatusNotificationController {

    @Autowired
    private StatusNotificationService statusNotificationService;

    @GetMapping("/waybill/{waybillNo}")
    public Result<List<StatusNotification>> getNotifications(@PathVariable String waybillNo) {
        return Result.success(statusNotificationService.getNotificationsByWaybillNo(waybillNo));
    }

    @PutMapping("/read/{id}")
    public Result<String> markAsRead(@PathVariable Long id) {
        boolean result = statusNotificationService.markAsRead(id);
        return result ? Result.success("标记成功") : Result.error("标记失败");
    }
}
