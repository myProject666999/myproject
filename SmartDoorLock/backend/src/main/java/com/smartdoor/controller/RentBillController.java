package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.PaymentDTO;
import com.smartdoor.dto.RentBillQueryDTO;
import com.smartdoor.entity.RentBill;
import com.smartdoor.service.RentBillService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "租金账单管理")
@RestController
@RequestMapping("/rent-bill")
public class RentBillController {

    @Autowired
    private RentBillService rentBillService;

    @ApiOperation("分页查询账单列表")
    @GetMapping("/page")
    public Result<PageResult<RentBill>> getBillPage(RentBillQueryDTO queryDTO) {
        return rentBillService.getBillPage(queryDTO);
    }

    @ApiOperation("获取账单详情")
    @GetMapping("/{id}")
    public Result<RentBill> getBillDetail(@PathVariable Long id) {
        return rentBillService.getBillDetail(id);
    }

    @ApiOperation("账单缴费")
    @PostMapping("/pay")
    public Result<Void> payBill(@RequestBody PaymentDTO dto) {
        return rentBillService.payBill(dto);
    }

    @ApiOperation("生成月度账单")
    @PostMapping("/generate-monthly")
    public Result<Void> generateMonthlyBills() {
        return rentBillService.generateMonthlyBills();
    }

    @ApiOperation("为指定租约生成账单")
    @PostMapping("/generate/{contractId}")
    public Result<Void> generateBillForContract(
            @PathVariable Long contractId,
            @RequestParam String billMonth) {
        return rentBillService.generateBillForContract(contractId, billMonth);
    }

    @ApiOperation("发送缴费提醒")
    @PostMapping("/{id}/reminder")
    public Result<Void> sendPaymentReminder(@PathVariable Long id) {
        return rentBillService.sendPaymentReminder(id);
    }
}
