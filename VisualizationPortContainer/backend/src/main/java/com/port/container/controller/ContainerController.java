package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.aspect.OperationLog;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.dto.ContainerInDTO;
import com.port.container.dto.ContainerOutDTO;
import com.port.container.dto.ContainerQueryDTO;
import com.port.container.entity.Container;
import com.port.container.service.ContainerService;
import com.port.container.vo.ContainerDetailVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/container")
public class ContainerController {

    @Autowired
    private ContainerService containerService;

    @GetMapping("/list")
    public R<PageResult<Container>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String containerNo,
            @RequestParam(required = false) String containerType,
            @RequestParam(required = false) String containerSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long yardId,
            @RequestParam(required = false) Long slotId,
            @RequestParam(required = false) String goodsName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime inTimeStart,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime inTimeEnd,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime outTimeStart,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime outTimeEnd) {
        IPage<Container> page = containerService.page(current != null ? current : 1L, size != null ? size : 10L);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<Container> getById(@PathVariable Long id) {
        return R.success(containerService.getById(id));
    }

    @GetMapping("/detail/{id}")
    public R<ContainerDetailVO> getDetail(@PathVariable Long id) {
        return R.success(containerService.getContainerDetail(id));
    }

    @GetMapping("/no/{containerNo}")
    public R<Container> getByContainerNo(@PathVariable String containerNo) {
        return R.success(containerService.getByContainerNo(containerNo));
    }

    @GetMapping("/in-yard")
    public R<PageResult<Container>> getInYardContainers(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String containerNo,
            @RequestParam(required = false) String containerType,
            @RequestParam(required = false) String containerSize,
            @RequestParam(required = false) Long yardId,
            @RequestParam(required = false) String goodsName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime inTimeStart,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime inTimeEnd) {
        ContainerQueryDTO dto = new ContainerQueryDTO();
        dto.setContainerNo(containerNo);
        dto.setContainerType(containerType);
        dto.setContainerSize(containerSize);
        dto.setYardId(yardId);
        dto.setGoodsName(goodsName);
        dto.setInTimeStart(inTimeStart);
        dto.setInTimeEnd(inTimeEnd);
        dto.setCurrent(current != null ? current : 1L);
        dto.setSize(size != null ? size : 10L);
        IPage<Container> page = containerService.getInYardContainers(dto);
        return R.success(PageResult.of(page));
    }

    @PostMapping("/inbound")
    @OperationLog(module = "集装箱管理", operationType = "进场", description = "集装箱进场登记")
    public R<Container> inbound(@Valid @RequestBody ContainerInDTO dto) {
        Container container = containerService.registerInbound(dto);
        return container != null ? R.success(container) : R.fail();
    }

    @PostMapping("/outbound")
    @OperationLog(module = "集装箱管理", operationType = "出场", description = "集装箱出场登记")
    public R<Container> outbound(@Valid @RequestBody ContainerOutDTO dto) {
        Container container = containerService.registerOutbound(dto);
        return container != null ? R.success(container) : R.fail();
    }

    @PostMapping("/add")
    @OperationLog(module = "集装箱管理", operationType = "新增", description = "新增集装箱")
    public R<Void> add(@Valid @RequestBody Container container) {
        boolean result = containerService.save(container);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/update")
    @OperationLog(module = "集装箱管理", operationType = "修改", description = "修改集装箱")
    public R<Void> update(@Valid @RequestBody Container container) {
        boolean result = containerService.update(container);
        return result ? R.success() : R.fail();
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "集装箱管理", operationType = "删除", description = "删除集装箱")
    public R<Void> delete(@PathVariable Long id) {
        boolean result = containerService.remove(id);
        return result ? R.success() : R.fail();
    }
}
