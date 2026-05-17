package com.mortgage.service;

import com.mortgage.entity.LoanScheme;
import com.mortgage.vo.LoanSchemeDetailVO;
import com.mortgage.vo.LoanSchemeStatisticsVO;

import java.util.List;

public interface LoanSchemeService {

    List<LoanScheme> list();

    LoanScheme getById(Long id);

    LoanScheme save(LoanScheme loanScheme);

    LoanScheme update(LoanScheme loanScheme);

    void delete(Long id);

    LoanSchemeDetailVO getDetail(Long id);

    LoanSchemeStatisticsVO getStatistics(Long id);

    void generateRepaymentPlan(Long schemeId);
}
