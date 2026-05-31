package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.aspect.OperationLog;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.dto.SlotQueryDTO;
import com.port.container.entity.YardSlot;
import com.port.container.service.YardSlotService;
import com.port.container.vo.SlotHeatmapVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/slot")
public class YardSlotController {

    @Autowired
    private YardSlotService yardSlotService;

    @GetMapping("/list")
    public R<PageResult<YardSlot>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Long yardId,
            @RequestParam(required = false) Integer rowNum,
            @RequestParam(required = false) Integer bayNum,
            @RequestParam(required = false) Integer tierNum,
            @RequestParam(required = false) String containerType,
            @RequestParam(required = false) BigDecimal minWeight,
            @RequestParam(required = false) BigDecimal maxWeight,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        IPage<YardSlot> page = yardSlotService.page(current != null ? current : 1L, size != null ? size : 10L);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<YardSlot> getById(@PathVariable Long id) {
        return R.success(yardSlotService.getById(id));
    }

    @GetMapping("/available")
    public R<List<YardSlot>> getAvailableSlots(
            @RequestParam(required = false) Long yardId,
            @RequestParam(required = false) Integer rowNum,
            @RequestParam(required = false) Integer bayNum,
            @RequestParam(required = false) Integer tierNum,
            @RequestParam(required = false) String containerType,
            @RequestParam(required = false) BigDecimal minWeight,
            @RequestParam(required = false) BigDecimal maxWeight,
            @RequestParam(required = false) Integer status) {
        SlotQueryDTO dto = new SlotQueryDTO();
        dto.setYardId(yardId);
        dto.setRowNum(rowNum);
        dto.setBayNum(bayNum);
        dto.setTierNum(tierNum);
        dto.setContainerType(containerType);
        dto.setMinWeight(minWeight);
        dto.setMaxWeight(maxWeight);
        dto.setStatus(status);
        return R.success(yardSlotService.getAvailableSlots(dto));
    }

    @GetMapping("/heatmap/{yardId}")
    public R<List<SlotHeatmapVO>> getHeatmapData(@PathVariable Long yardId) {
        return R.success(yardSlotService.getSlotHeatmapData(yardId));
    }

    @GetMapping("/byLayer/{yardId}/{tierNo}")
    public R<List<YardSlot>> getSlotsByLayer(@PathVariable Long yardId, @PathVariable Integer tierNo) {
        return R.success(yardSlotService.getSlotsByYardAndLayer(yardId, tierNo));
    }

    @PostMapping("/lock/{slotId}")
    @OperationLog(module = "箱位管理", operationType = "锁定", description = "锁定箱位")
    public R<Void> lockSlot(@PathVariable Long slotId, @RequestBody Map<String, Long> params) {
        Long operatorId = params.get("operatorId");
        boolean result = yardSlotService.lockSlot(slotId, operatorId);
        return result ? R.success() : R.fail();
    }

    @PostMapping("/occupy")
    @OperationLog(module = "箱位管理", operationType = "占用", description = "占用箱位")
    public R<Void> occupySlot(@RequestBody Map<String, Long> params) {
        Long slotId = params.get("slotId");
        Long containerId = params.get("containerId");
        boolean result = yardSlotService.occupySlot(slotId, containerId);
        return result ? R.success() : R.fail();
    }

    @PostMapping("/release/{slotId}")
    @OperationLog(module = "箱位管理", operationType = "释放", description = "释放箱位")
    public R<Void> releaseSlot(@PathVariable Long slotId) {
        boolean result = yardSlotService.releaseSlot(slotId);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/update")
    @OperationLog(module = "箱位管理", operationType = "修改", description = "修改箱位")
    public R<Void> update(@Valid @RequestBody YardSlot yardSlot) {
        boolean result = yardSlotService.update(yardSlot);
        return result ? R.success() : R.fail();
    }
}
