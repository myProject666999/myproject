package com.cloudbackup.controller;

import com.cloudbackup.common.Result;
import com.cloudbackup.entity.AddressBook;
import com.cloudbackup.entity.VersionSnapshot;
import com.cloudbackup.service.AddressBookService;
import com.cloudbackup.service.VersionSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/versions")
@RequiredArgsConstructor
@CrossOrigin
public class VersionController {

    private final VersionSnapshotService versionSnapshotService;
    private final AddressBookService addressBookService;

    @GetMapping("/list")
    public Result<List<VersionSnapshot>> list(@RequestParam("userId") String userId) {
        AddressBook addressBook = addressBookService.getOrCreateByUserId(userId);
        List<VersionSnapshot> snapshots = versionSnapshotService.listByAddressBookId(addressBook.getId());
        return Result.success(snapshots);
    }

    @GetMapping("/{snapshotId}")
    public Result<VersionSnapshot> get(@PathVariable Long snapshotId) {
        VersionSnapshot snapshot = versionSnapshotService.getById(snapshotId);
        if (snapshot == null) {
            return Result.error("版本快照不存在");
        }
        return Result.success(snapshot);
    }

    @GetMapping("/compare")
    public Result<Map<String, Object>> compare(
            @RequestParam("snapshotId1") Long snapshotId1,
            @RequestParam("snapshotId2") Long snapshotId2) {
        try {
            Map<String, Object> result = versionSnapshotService.compareVersions(snapshotId1, snapshotId2);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("对比失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{snapshotId}")
    public Result<Void> delete(@PathVariable Long snapshotId) {
        versionSnapshotService.removeById(snapshotId);
        return Result.success();
    }
}
