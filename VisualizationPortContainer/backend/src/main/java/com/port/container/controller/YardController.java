package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.aspect.OperationLog;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.entity.Yard;
import com.port.container.service.YardService;
import com.port.container.vo.YardOverviewVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/yard")
public class YardController {

    @Autowired
    private YardService yardService;

    @GetMapping("/list")
    public R<PageResult<Yard>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String yardCode,
            @RequestParam(required = false) String yardName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        IPage<Yard> page = yardService.page(current != null ? current : 1L, size != null ? size : 10L);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<Yard> getById(@PathVariable Long id) {
        return R.success(yardService.getById(id));
    }

    @GetMapping("/overview/{yardId}")
    public R<YardOverviewVO> getYardOverview(@PathVariable Long yardId) {
        return R.success(yardService.getYardOverview(yardId));
    }

    @GetMapping("/overview/all")
    public R<List<YardOverviewVO>> getAllYardOverviews() {
        return R.success(yardService.getAllYardOverviews());
    }

    @PostMapping("/add")
    @OperationLog(module = "堆场管理", operationType = "新增", description = "新增堆场")
    public R<Void> add(@Valid @RequestBody Yard yard) {
        boolean result = yardService.save(yard);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/update")
    @OperationLog(module = "堆场管理", operationType = "修改", description = "修改堆场")
    public R<Void> update(@Valid @RequestBody Yard yard) {
        boolean result = yardService.update(yard);
        return result ? R.success() : R.fail();
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "堆场管理", operationType = "删除", description = "删除堆场")
    public R<Void> delete(@PathVariable Long id) {
        boolean result = yardService.remove(id);
        return result ? R.success() : R.fail();
    }
}
