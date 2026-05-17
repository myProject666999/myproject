package com.mortgage.service;

import com.mortgage.dto.LoanCalculateDTO;
import com.mortgage.dto.PrepaymentSimulateDTO;
import com.mortgage.vo.LoanCalculateResultVO;
import com.mortgage.vo.PrepaymentResultVO;

public interface MortgageCalculatorService {

    LoanCalculateResultVO calculate(LoanCalculateDTO dto);

    PrepaymentResultVO simulatePrepayment(PrepaymentSimulateDTO dto);
}
