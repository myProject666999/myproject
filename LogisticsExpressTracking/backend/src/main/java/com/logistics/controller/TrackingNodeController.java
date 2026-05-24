package com.logistics.controller;

import com.logistics.dto.TrackingNodeCreateDTO;
import com.logistics.entity.TrackingNode;
import com.logistics.service.TrackingNodeService;
import com.logistics.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tracking")
public class TrackingNodeController {

    @Autowired
    private TrackingNodeService trackingNodeService;

    @PostMapping("/add")
    public Result<String> addTrackingNode(@Valid @RequestBody TrackingNodeCreateDTO dto) {
        boolean result = trackingNodeService.addTrackingNode(dto);
        return result ? Result.success("轨迹节点添加成功") : Result.error("轨迹节点添加失败");
    }

    @GetMapping("/waybill/{waybillNo}")
    public Result<List<TrackingNode>> getTrackingNodes(@PathVariable String waybillNo) {
        return Result.success(trackingNodeService.getTrackingNodesByWaybillNo(waybillNo));
    }

    @GetMapping("/waybill-id/{waybillId}")
    public Result<List<TrackingNode>> getTrackingNodesByWaybillId(@PathVariable Long waybillId) {
        return Result.success(trackingNodeService.getTrackingNodesByWaybillId(waybillId));
    }
}
