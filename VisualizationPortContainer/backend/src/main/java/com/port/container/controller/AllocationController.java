package com.port.container.controller;

import com.port.container.aspect.OperationLog;
import com.port.container.common.R;
import com.port.container.dto.AllocationSuggestionDTO;
import com.port.container.entity.AllocationRecord;
import com.port.container.service.AllocationService;
import com.port.container.vo.AllocationSuggestionVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/allocation")
public class AllocationController {

    @Autowired
    private AllocationService allocationService;

    @PostMapping("/suggest")
    public R<List<AllocationSuggestionVO>> suggest(@Valid @RequestBody AllocationSuggestionDTO dto) {
        return R.success(allocationService.suggestSlot(dto));
    }

    @PostMapping("/confirm")
    @OperationLog(module = "分配管理", operationType = "确认分配", description = "确认堆位分配")
    public R<Void> confirm(@RequestBody Map<String, Object> params) {
        Long containerId = params.get("containerId") != null ? Long.valueOf(params.get("containerId").toString()) : null;
        Long slotId = params.get("slotId") != null ? Long.valueOf(params.get("slotId").toString()) : null;
        String strategyName = params.get("strategyName") != null ? params.get("strategyName").toString() : null;
        Long operatorId = params.get("operatorId") != null ? Long.valueOf(params.get("operatorId").toString()) : null;
        boolean result = allocationService.confirmAllocation(containerId, slotId, strategyName, operatorId);
        return result ? R.success() : R.fail();
    }

    @PostMapping("/auto")
    @OperationLog(module = "分配管理", operationType = "自动分配", description = "自动分配堆位")
    public R<Void> auto(@RequestBody Map<String, Long> params) {
        Long containerId = params.get("containerId");
        Long operatorId = params.get("operatorId");
        boolean result = allocationService.autoAllocate(containerId, operatorId);
        return result ? R.success() : R.fail();
    }

    @GetMapping("/history/{containerId}")
    public R<List<AllocationRecord>> getHistory(@PathVariable Long containerId) {
        return R.success(allocationService.getAllocationHistory(containerId));
    }
}
