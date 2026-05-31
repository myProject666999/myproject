package com.market.stall.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.market.stall.common.PageResult;
import com.market.stall.common.Result;
import com.market.stall.dto.AuditDTO;
import com.market.stall.dto.RegistrationDTO;
import com.market.stall.entity.Registration;
import com.market.stall.service.RegistrationService;
import com.market.stall.vo.RegistrationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/registration")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    private Long getCurrentUserId() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return Long.parseLong(principal.toString());
    }

    @PostMapping
    public Result<Void> submit(@RequestBody @Valid RegistrationDTO dto) {
        registrationService.submitRegistration(dto, getCurrentUserId());
        return Result.success();
    }

    @GetMapping("/page")
    public Result<PageResult<RegistrationVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam Long eventId,
            @RequestParam(required = false) Integer auditStatus,
            @RequestParam(required = false) Integer status) {
        IPage<Registration> page = new Page<>(pageNum, pageSize);
        return Result.success(new PageResult<>(registrationService.pageRegistrations(page, eventId, auditStatus, status)));
    }

    @GetMapping("/{id}")
    public Result<RegistrationVO> detail(@PathVariable Long id) {
        return Result.success(registrationService.getRegistrationDetail(id));
    }

    @PostMapping("/audit")
    public Result<Void> audit(@RequestBody @Valid AuditDTO dto) {
        registrationService.auditRegistration(dto, getCurrentUserId());
        return Result.success();
    }

    @PostMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id) {
        registrationService.cancelRegistration(id, getCurrentUserId());
        return Result.success();
    }
}
