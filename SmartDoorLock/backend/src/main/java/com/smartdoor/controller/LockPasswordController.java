package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.LockPasswordQueryDTO;
import com.smartdoor.dto.SendPasswordDTO;
import com.smartdoor.entity.LockPassword;
import com.smartdoor.service.LockPasswordService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "门锁密码管理")
@RestController
@RequestMapping("/lock-password")
public class LockPasswordController {

    @Autowired
    private LockPasswordService lockPasswordService;

    @ApiOperation("分页查询密码列表")
    @GetMapping("/page")
    public Result<PageResult<LockPassword>> getPasswordPage(LockPasswordQueryDTO queryDTO) {
        return lockPasswordService.getPasswordPage(queryDTO);
    }

    @ApiOperation("获取密码详情")
    @GetMapping("/{id}")
    public Result<LockPassword> getPasswordDetail(@PathVariable Long id) {
        return lockPasswordService.getPasswordDetail(id);
    }

    @ApiOperation("下发门锁密码")
    @PostMapping("/send")
    public Result<LockPassword> sendPassword(@RequestBody SendPasswordDTO dto) {
        return lockPasswordService.sendPassword(dto);
    }

    @ApiOperation("重发密码")
    @PutMapping("/{id}/resend")
    public Result<Void> resendPassword(@PathVariable Long id) {
        return lockPasswordService.resendPassword(id);
    }

    @ApiOperation("取消密码")
    @PutMapping("/{id}/cancel")
    public Result<Void> cancelPassword(@PathVariable Long id) {
        return lockPasswordService.cancelPassword(id);
    }

    @ApiOperation("冻结密码")
    @PutMapping("/{id}/freeze")
    public Result<Void> freezePassword(@PathVariable Long id) {
        return lockPasswordService.freezePassword(id);
    }

    @ApiOperation("解冻密码")
    @PutMapping("/{id}/unfreeze")
    public Result<Void> unfreezePassword(@PathVariable Long id) {
        return lockPasswordService.unfreezePassword(id);
    }
}
