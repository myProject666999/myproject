package com.logistics.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.logistics.dto.WaybillCreateDTO;
import com.logistics.dto.WaybillQueryDTO;
import com.logistics.entity.Waybill;
import com.logistics.service.WaybillService;
import com.logistics.vo.Result;
import com.logistics.vo.WaybillDetailVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/waybill")
public class WaybillController {

    @Autowired
    private WaybillService waybillService;

    @PostMapping("/create")
    public Result<Map<String, String>> createWaybill(@Valid @RequestBody WaybillCreateDTO dto) {
        String waybillNo = waybillService.createWaybill(dto);
        Map<String, String> data = new HashMap<>();
        data.put("waybillNo", waybillNo);
        return Result.success(data);
    }

    @GetMapping("/detail/{waybillNo}")
    public Result<WaybillDetailVO> getWaybillDetail(@PathVariable String waybillNo) {
        WaybillDetailVO detail = waybillService.getWaybillDetail(waybillNo);
        if (detail == null) {
            return Result.error(404, "运单不存在");
        }
        return Result.success(detail);
    }

    @PostMapping("/query")
    public Result<IPage<Waybill>> queryWaybills(@RequestBody WaybillQueryDTO dto) {
        return Result.success(waybillService.queryWaybills(dto));
    }

    @PutMapping("/update")
    public Result<String> updateWaybill(@RequestBody Waybill waybill) {
        boolean result = waybillService.updateWaybill(waybill);
        return result ? Result.success("更新成功") : Result.error("更新失败");
    }

    @PutMapping("/status/{id}/{status}")
    public Result<String> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        boolean result = waybillService.updateWaybillStatus(id, status);
        return result ? Result.success("状态更新成功") : Result.error("状态更新失败");
    }

    @DeleteMapping("/delete/{id}")
    public Result<String> deleteWaybill(@PathVariable Long id) {
        boolean result = waybillService.removeById(id);
        return result ? Result.success("删除成功") : Result.error("删除失败");
    }
}
