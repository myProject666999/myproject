package com.recruitment.controller;

import com.recruitment.common.Result;
import com.recruitment.dto.CompanyUpdateDTO;
import com.recruitment.vo.CompanyVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "企业接口")
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @ApiOperation("获取我的企业")
    @GetMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public Result<CompanyVO> getMyCompany() {
        return Result.ok();
    }

    @ApiOperation("更新企业信息")
    @PutMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public Result<Void> updateMyCompany(@Validated @RequestBody CompanyUpdateDTO updateDTO) {
        return Result.ok();
    }

    @ApiOperation("企业详情")
    @GetMapping("/{id}")
    public Result<CompanyVO> getCompanyDetail(@PathVariable Long id) {
        return Result.ok();
    }
}
