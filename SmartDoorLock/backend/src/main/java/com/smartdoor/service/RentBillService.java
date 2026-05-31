package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.PaymentDTO;
import com.smartdoor.dto.RentBillQueryDTO;
import com.smartdoor.entity.RentBill;

public interface RentBillService extends IService<RentBill> {
    Result<PageResult<RentBill>> getBillPage(RentBillQueryDTO queryDTO);
    Result<RentBill> getBillDetail(Long id);
    Result<Void> payBill(PaymentDTO dto);
    Result<Void> generateMonthlyBills();
    Result<Void> generateBillForContract(Long contractId, String billMonth);
    Result<Void> sendPaymentReminder(Long billId);
    void checkBillOverdue();
    void sendPaymentReminders();
}
