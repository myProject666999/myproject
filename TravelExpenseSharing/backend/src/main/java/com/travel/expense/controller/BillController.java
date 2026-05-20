package com.travel.expense.controller;

import com.travel.expense.common.Result;
import com.travel.expense.dto.BillDTO;
import com.travel.expense.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @GetMapping
    public Result<List<BillDTO>> getAllBills() {
        return Result.success(billService.getAllBills());
    }

    @GetMapping("/{id}")
    public Result<BillDTO> getBillById(@PathVariable Long id) {
        BillDTO bill = billService.getBillById(id);
        if (bill == null) {
            return Result.error("Bill not found");
        }
        return Result.success(bill);
    }

    @PostMapping
    public Result<BillDTO> createBill(@RequestBody BillDTO billDTO) {
        if (billDTO.getTitle() == null || billDTO.getTitle().trim().isEmpty()) {
            return Result.error("Title cannot be empty");
        }
        if (billDTO.getAmount() == null || billDTO.getAmount().doubleValue() <= 0) {
            return Result.error("Amount must be greater than 0");
        }
        if (billDTO.getPayerId() == null) {
            return Result.error("Payer cannot be empty");
        }
        if (billDTO.getSplits() == null || billDTO.getSplits().isEmpty()) {
            return Result.error("At least one participant is required");
        }
        return Result.success(billService.createBill(billDTO));
    }

    @PutMapping("/{id}")
    public Result<BillDTO> updateBill(@PathVariable Long id, @RequestBody BillDTO billDTO) {
        BillDTO updated = billService.updateBill(id, billDTO);
        if (updated == null) {
            return Result.error("Bill not found");
        }
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteBill(@PathVariable Long id) {
        boolean deleted = billService.deleteBill(id);
        if (!deleted) {
            return Result.error("Bill not found");
        }
        return Result.success();
    }

}
