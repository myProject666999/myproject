package com.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.recruitment.entity.Company;
import com.recruitment.entity.User;
import com.recruitment.enums.RoleEnum;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.CompanyMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CompanyService {

    @Autowired
    private CompanyMapper companyMapper;

    @Autowired
    private UserService userService;

    public Company getMyCompany() {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以查看企业信息");
        }
        Company company = companyMapper.selectOne(
            new LambdaQueryWrapper<Company>()
                .eq(Company::getHrId, currentUser.getId())
                .eq(Company::getDeleted, 0)
        );
        return company;
    }

    @Transactional(rollbackFor = Exception.class)
    public Company createOrUpdateCompany(Company company) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以管理企业信息");
        }
        Company existCompany = companyMapper.selectOne(
            new LambdaQueryWrapper<Company>()
                .eq(Company::getHrId, currentUser.getId())
                .eq(Company::getDeleted, 0)
        );
        if (existCompany == null) {
            company.setHrId(currentUser.getId());
            company.setVerified(0);
            company.setDeleted(0);
            company.setCreatedAt(LocalDateTime.now());
            company.setUpdatedAt(LocalDateTime.now());
            companyMapper.insert(company);
        } else {
            company.setId(existCompany.getId());
            company.setHrId(currentUser.getId());
            company.setVerified(existCompany.getVerified());
            company.setDeleted(0);
            company.setCreatedAt(existCompany.getCreatedAt());
            company.setUpdatedAt(LocalDateTime.now());
            companyMapper.updateById(company);
        }
        return companyMapper.selectById(company.getId());
    }

    public Company getCompanyById(Long id) {
        Company company = companyMapper.selectById(id);
        if (company == null || company.getDeleted() == 1) {
            throw new BusinessException("企业不存在");
        }
        return company;
    }
}
