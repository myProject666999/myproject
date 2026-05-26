package com.corporate.reimbursement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.*;
import com.corporate.reimbursement.mapper.*;
import com.corporate.reimbursement.service.ReimbursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reimbursement")
public class ReimbursementController {

    @Autowired
    private ReimbursementService reimbursementService;

    @Autowired
    private ReimbursementItemMapper reimbursementItemMapper;

    @Autowired
    private InvoiceAttachmentMapper invoiceAttachmentMapper;

    @Autowired
    private ReimbursementTypeMapper reimbursementTypeMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    private Long getCurrentUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        return userIdStr != null ? Long.parseLong(userIdStr) : 1L;
    }

    @PostMapping("/create")
    public Result<Reimbursement> create(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);

        String title = (String) params.get("title");
        String typeCode = (String) params.get("type");
        String reason = (String) params.get("reason");

        Long typeId = null;
        if (typeCode != null && !typeCode.isEmpty()) {
            ReimbursementType type = reimbursementTypeMapper.selectOne(
                    Wrappers.<ReimbursementType>lambdaQuery().eq(ReimbursementType::getTypeCode, typeCode));
            if (type != null) {
                typeId = type.getId();
            }
        }

        SysUser user = sysUserMapper.selectById(userId);

        Reimbursement reimbursement = new Reimbursement();
        reimbursement.setTitle(title);
        reimbursement.setTypeId(typeId);
        reimbursement.setApplicantId(userId);
        reimbursement.setDeptId(user != null ? user.getDeptId() : null);
        reimbursement.setReason(reason);

        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) params.get("items");
        List<ReimbursementItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (itemsData != null) {
            for (Map<String, Object> itemData : itemsData) {
                ReimbursementItem item = new ReimbursementItem();
                item.setItemName((String) itemData.get("name"));
                item.setItemType((String) itemData.get("itemType"));
                item.setAmount(itemData.get("amount") != null ? new BigDecimal(itemData.get("amount").toString()) : BigDecimal.ZERO);
                item.setQuantity(itemData.get("quantity") != null ? Integer.valueOf(itemData.get("quantity").toString()) : 1);
                item.setUnitPrice(itemData.get("unitPrice") != null ? new BigDecimal(itemData.get("unitPrice").toString()) : BigDecimal.ZERO);
                if (itemData.get("expenseDate") != null && !itemData.get("expenseDate").toString().isEmpty()) {
                    item.setExpenseDate(LocalDate.parse(itemData.get("expenseDate").toString()));
                }
                item.setDescription((String) itemData.get("description"));
                totalAmount = totalAmount.add(item.getAmount());
                items.add(item);
            }
        }
        reimbursement.setTotalAmount(totalAmount);

        List<Map<String, Object>> attachmentsData = (List<Map<String, Object>>) params.get("attachments");
        List<InvoiceAttachment> attachments = new ArrayList<>();
        if (attachmentsData != null) {
            for (Map<String, Object> attData : attachmentsData) {
                InvoiceAttachment attachment = new InvoiceAttachment();
                attachment.setFileName((String) attData.get("fileName"));
                attachment.setFilePath((String) attData.get("fileUrl"));
                attachment.setFileType((String) attData.get("fileType"));
                attachment.setFileSize(attData.get("fileSize") != null ? Long.valueOf(attData.get("fileSize").toString()) : 0L);
                attachment.setInvoiceNo((String) attData.get("invoiceNo"));
                attachment.setInvoiceCode((String) attData.get("invoiceCode"));
                attachment.setInvoiceAmount(attData.get("invoiceAmount") != null ? new BigDecimal(attData.get("invoiceAmount").toString()) : BigDecimal.ZERO);
                attachments.add(attachment);
            }
        }

        String status = (String) params.get("status");
        if (status == null || status.isEmpty()) {
            status = "DRAFT";
        }
        reimbursement.setStatus(status);

        Reimbursement result = reimbursementService.createReimbursement(reimbursement, items, attachments);
        return Result.success("创建成功", result);
    }

    @PutMapping("/update/{id}")
    public Result<Reimbursement> update(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        String title = (String) params.get("title");
        String typeCode = (String) params.get("type");
        String reason = (String) params.get("reason");

        Long typeId = null;
        if (typeCode != null && !typeCode.isEmpty()) {
            ReimbursementType type = reimbursementTypeMapper.selectOne(
                    Wrappers.<ReimbursementType>lambdaQuery().eq(ReimbursementType::getTypeCode, typeCode));
            if (type != null) {
                typeId = type.getId();
            }
        }

        Reimbursement reimbursement = new Reimbursement();
        reimbursement.setId(id);
        reimbursement.setTitle(title);
        reimbursement.setTypeId(typeId);
        reimbursement.setReason(reason);

        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) params.get("items");
        List<ReimbursementItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (itemsData != null) {
            for (Map<String, Object> itemData : itemsData) {
                ReimbursementItem item = new ReimbursementItem();
                if (itemData.get("id") != null) {
                    item.setId(Long.valueOf(itemData.get("id").toString()));
                }
                item.setItemName((String) itemData.get("name"));
                item.setItemType((String) itemData.get("itemType"));
                item.setAmount(itemData.get("amount") != null ? new BigDecimal(itemData.get("amount").toString()) : BigDecimal.ZERO);
                item.setQuantity(itemData.get("quantity") != null ? Integer.valueOf(itemData.get("quantity").toString()) : 1);
                item.setUnitPrice(itemData.get("unitPrice") != null ? new BigDecimal(itemData.get("unitPrice").toString()) : BigDecimal.ZERO);
                if (itemData.get("expenseDate") != null && !itemData.get("expenseDate").toString().isEmpty()) {
                    item.setExpenseDate(LocalDate.parse(itemData.get("expenseDate").toString()));
                }
                item.setDescription((String) itemData.get("description"));
                totalAmount = totalAmount.add(item.getAmount());
                items.add(item);
            }
        }
        reimbursement.setTotalAmount(totalAmount);

        List<Map<String, Object>> attachmentsData = (List<Map<String, Object>>) params.get("attachments");
        List<InvoiceAttachment> attachments = new ArrayList<>();
        if (attachmentsData != null) {
            for (Map<String, Object> attData : attachmentsData) {
                InvoiceAttachment attachment = new InvoiceAttachment();
                if (attData.get("id") != null) {
                    attachment.setId(Long.valueOf(attData.get("id").toString()));
                }
                attachment.setFileName((String) attData.get("fileName"));
                attachment.setFilePath((String) attData.get("fileUrl"));
                attachment.setFileType((String) attData.get("fileType"));
                attachment.setFileSize(attData.get("fileSize") != null ? Long.valueOf(attData.get("fileSize").toString()) : 0L);
                attachment.setInvoiceNo((String) attData.get("invoiceNo"));
                attachment.setInvoiceCode((String) attData.get("invoiceCode"));
                attachment.setInvoiceAmount(attData.get("invoiceAmount") != null ? new BigDecimal(attData.get("invoiceAmount").toString()) : BigDecimal.ZERO);
                attachments.add(attachment);
            }
        }

        Reimbursement result = reimbursementService.updateReimbursement(reimbursement, items, attachments);
        return Result.success("更新成功", result);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        reimbursementService.deleteReimbursement(id);
        return Result.success("删除成功", null);
    }

    @PostMapping("/submit/{id}")
    public Result<Reimbursement> submit(@PathVariable Long id) {
        Reimbursement result = reimbursementService.submitReimbursement(id);
        return Result.success("提交成功", result);
    }

    @GetMapping("/my")
    public Result<IPage<Map<String, Object>>> myReimbursements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        IPage<Reimbursement> result = reimbursementService.getMyReimbursements(userId, page, size);

        List<Map<String, Object>> records = new ArrayList<>();
        for (Reimbursement r : result.getRecords()) {
            records.add(convertToMap(r));
        }

        IPage<Map<String, Object>> pageResult = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        pageResult.setRecords(records);
        return Result.success(pageResult);
    }

    @GetMapping("/detail/{id}")
    public Result<Map<String, Object>> detail(@PathVariable Long id) {
        Reimbursement reimbursement = reimbursementService.getDetail(id);
        if (reimbursement == null) {
            return Result.error("报销单不存在");
        }

        List<ReimbursementItem> items = reimbursementItemMapper.selectList(
                Wrappers.<ReimbursementItem>lambdaQuery().eq(ReimbursementItem::getReimbursementId, id));
        List<InvoiceAttachment> attachments = invoiceAttachmentMapper.selectList(
                Wrappers.<InvoiceAttachment>lambdaQuery().eq(InvoiceAttachment::getReimbursementId, id));

        Map<String, Object> data = convertToMap(reimbursement);

        List<Map<String, Object>> itemMaps = new ArrayList<>();
        for (ReimbursementItem item : items) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("id", String.valueOf(item.getId()));
            itemMap.put("reimbursementId", String.valueOf(item.getReimbursementId()));
            itemMap.put("itemName", item.getItemName());
            itemMap.put("itemType", item.getItemType());
            itemMap.put("amount", item.getAmount());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("unitPrice", item.getUnitPrice());
            itemMap.put("expenseDate", item.getExpenseDate());
            itemMap.put("description", item.getDescription());
            itemMap.put("createTime", item.getCreateTime());
            itemMaps.add(itemMap);
        }
        data.put("items", itemMaps);

        List<Map<String, Object>> attachmentMaps = new ArrayList<>();
        for (InvoiceAttachment att : attachments) {
            Map<String, Object> attMap = new HashMap<>();
            attMap.put("id", String.valueOf(att.getId()));
            attMap.put("reimbursementId", String.valueOf(att.getReimbursementId()));
            attMap.put("fileName", att.getFileName());
            attMap.put("fileUrl", att.getFilePath());
            attMap.put("fileSize", att.getFileSize());
            attMap.put("fileType", att.getFileType());
            attMap.put("createTime", att.getCreateTime());
            attachmentMaps.add(attMap);
        }
        data.put("attachments", attachmentMaps);

        return Result.success(data);
    }

    private Map<String, Object> convertToMap(Reimbursement r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(r.getId()));
        map.put("reimburseNo", r.getReimbursementNo());
        map.put("title", r.getTitle());
        map.put("typeId", r.getTypeId() != null ? String.valueOf(r.getTypeId()) : null);
        map.put("applicantId", r.getApplicantId() != null ? String.valueOf(r.getApplicantId()) : null);
        map.put("deptId", r.getDeptId());
        map.put("totalAmount", r.getTotalAmount());
        map.put("reason", r.getReason());
        map.put("status", r.getStatus());
        map.put("currentApproverId", r.getCurrentApproverId() != null ? String.valueOf(r.getCurrentApproverId()) : null);
        map.put("currentApprovalLevel", r.getCurrentApprovalLevel());
        map.put("submitTime", r.getSubmitTime());
        map.put("approvalTime", r.getApprovalTime());
        map.put("paymentTime", r.getPaymentTime());
        map.put("createTime", r.getCreateTime());

        if (r.getTypeId() != null) {
            ReimbursementType type = reimbursementTypeMapper.selectById(r.getTypeId());
            if (type != null) {
                map.put("typeCode", type.getTypeCode());
                map.put("typeName", type.getTypeName());
            }
        }

        if (r.getApplicantId() != null) {
            SysUser user = sysUserMapper.selectById(r.getApplicantId());
            if (user != null) {
                map.put("applicantName", user.getRealName());
                map.put("applicantEmployeeNo", user.getEmployeeNo());
            }
        }

        if (r.getCurrentApproverId() != null) {
            SysUser approver = sysUserMapper.selectById(r.getCurrentApproverId());
            if (approver != null) {
                map.put("currentApproverName", approver.getRealName());
            }
        }

        return map;
    }
}