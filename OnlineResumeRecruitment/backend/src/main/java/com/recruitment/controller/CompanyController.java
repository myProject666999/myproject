package com.recruitment.controller;

import com.recruitment.common.Result;
import com.recruitment.dto.CompanyUpdateDTO;
import com.recruitment.entity.Company;
import com.recruitment.service.CompanyService;
import com.recruitment.vo.CompanyVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "企业接口")
@RestController
@RequestMapping("/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @ApiOperation("获取我的企业")
    @GetMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public Result<CompanyVO> getMyCompany() {
        Company company = companyService.getMyCompany();
        return Result.ok(new CompanyVO(company));
    }

    @ApiOperation("更新企业信息")
    @PutMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public Result<CompanyVO> updateMyCompany(@Validated @RequestBody CompanyUpdateDTO updateDTO) {
        Company company = new Company();
        BeanUtils.copyProperties(updateDTO, company);
        Company savedCompany = companyService.createOrUpdateCompany(company);
        return Result.ok(new CompanyVO(savedCompany));
    }

    @ApiOperation("企业详情")
    @GetMapping("/{id}")
    public Result<CompanyVO> getCompanyDetail(@PathVariable Long id) {
        Company company = companyService.getCompanyById(id);
        return Result.ok(new CompanyVO(company));
    }
}