package com.giftwishlist.controller;

import com.giftwishlist.common.Result;
import com.giftwishlist.entity.ClaimRecord;
import com.giftwishlist.service.ClaimRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/claim-records")
@CrossOrigin
public class ClaimRecordController {

    @Autowired
    private ClaimRecordService claimRecordService;

    @GetMapping("/user/{userId}")
    public Result<List<ClaimRecord>> getByUserId(@PathVariable Long userId) {
        return Result.success(claimRecordService.getByUserId(userId));
    }

    @GetMapping("/owner/{ownerId}")
    public Result<List<ClaimRecord>> getByOwnerId(@PathVariable Long ownerId) {
        return Result.success(claimRecordService.getByOwnerId(ownerId));
    }

    @PutMapping("/{id}/purchased")
    public Result<Boolean> markPurchased(@PathVariable Long id) {
        ClaimRecord record = claimRecordService.getById(id);
        if (record == null) {
            return Result.error("记录不存在");
        }
        record.setIsPurchased(1);
        return Result.success(claimRecordService.updateById(record));
    }
}
