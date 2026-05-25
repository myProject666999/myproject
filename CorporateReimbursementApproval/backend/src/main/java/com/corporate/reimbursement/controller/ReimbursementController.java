package com.corporate.reimbursement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.InvoiceAttachment;
import com.corporate.reimbursement.entity.Reimbursement;
import com.corporate.reimbursement.entity.ReimbursementItem;
import com.corporate.reimbursement.mapper.InvoiceAttachmentMapper;
import com.corporate.reimbursement.mapper.ReimbursementItemMapper;
import com.corporate.reimbursement.service.ReimbursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reimbursement")
public class ReimbursementController {

    @Autowired
    private ReimbursementService reimbursementService;

    @Autowired
    private ReimbursementItemMapper reimbursementItemMapper;

    @Autowired
    private InvoiceAttachmentMapper invoiceAttachmentMapper;

    private Long getCurrentUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        return userIdStr != null ? Long.parseLong(userIdStr) : 1L;
    }

    @PostMapping("/create")
    public Result<Reimbursement> create(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);

        Map<String, Object> reimbData = (Map<String, Object>) params.get("reimbursement");
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) params.get("items");
        List<Map<String, Object>> attachmentsData = (List<Map<String, Object>>) params.get("attachments");

        Reimbursement reimbursement = new Reimbursement();
        reimbursement.setTitle((String) reimbData.get("title"));
        reimbursement.setTypeId(reimbData.get("typeId") != null ? Long.valueOf(reimbData.get("typeId").toString()) : null);
        reimbursement.setApplicantId(userId);
        reimbursement.setDeptId(reimbData.get("deptId") != null ? Long.valueOf(reimbData.get("deptId").toString()) : null);
        reimbursement.setTotalAmount(reimbData.get("totalAmount") != null ? new BigDecimal(reimbData.get("totalAmount").toString()) : BigDecimal.ZERO);
        reimbursement.setReason((String) reimbData.get("reason"));
        reimbursement.setStatus(0);

        List<ReimbursementItem> items = new ArrayList<>();
        if (itemsData != null) {
            for (Map<String, Object> itemData : itemsData) {
                ReimbursementItem item = new ReimbursementItem();
                item.setItemName((String) itemData.get("itemName"));
                item.setItemType((String) itemData.get("itemType"));
                item.setAmount(itemData.get("amount") != null ? new BigDecimal(itemData.get("amount").toString()) : BigDecimal.ZERO);
                item.setQuantity(itemData.get("quantity") != null ? Integer.valueOf(itemData.get("quantity").toString()) : 1);
                item.setUnitPrice(itemData.get("unitPrice") != null ? new BigDecimal(itemData.get("unitPrice").toString()) : BigDecimal.ZERO);
                if (itemData.get("expenseDate") != null) {
                    item.setExpenseDate(LocalDate.parse(itemData.get("expenseDate").toString()));
                }
                item.setDescription((String) itemData.get("description"));
                items.add(item);
            }
        }

        List<InvoiceAttachment> attachments = new ArrayList<>();
        if (attachmentsData != null) {
            for (Map<String, Object> attData : attachmentsData) {
                InvoiceAttachment attachment = new InvoiceAttachment();
                attachment.setFileName((String) attData.get("fileName"));
                attachment.setFilePath((String) attData.get("filePath"));
                attachment.setFileType((String) attData.get("fileType"));
                attachment.setFileSize(attData.get("fileSize") != null ? Long.valueOf(attData.get("fileSize").toString()) : 0L);
                attachment.setInvoiceNo((String) attData.get("invoiceNo"));
                attachment.setInvoiceCode((String) attData.get("invoiceCode"));
                attachment.setInvoiceAmount(attData.get("invoiceAmount") != null ? new BigDecimal(attData.get("invoiceAmount").toString()) : BigDecimal.ZERO);
                attachments.add(attachment);
            }
        }

        Reimbursement result = reimbursementService.createReimbursement(reimbursement, items, attachments);
        return Result.success("创建成功", result);
    }

    @PutMapping("/update/{id}")
    public Result<Reimbursement> update(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Map<String, Object> reimbData = (Map<String, Object>) params.get("reimbursement");
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) params.get("items");
        List<Map<String, Object>> attachmentsData = (List<Map<String, Object>>) params.get("attachments");

        Reimbursement reimbursement = new Reimbursement();
        reimbursement.setId(id);
        reimbursement.setTitle((String) reimbData.get("title"));
        reimbursement.setTypeId(reimbData.get("typeId") != null ? Long.valueOf(reimbData.get("typeId").toString()) : null);
        reimbursement.setDeptId(reimbData.get("deptId") != null ? Long.valueOf(reimbData.get("deptId").toString()) : null);
        reimbursement.setTotalAmount(reimbData.get("totalAmount") != null ? new BigDecimal(reimbData.get("totalAmount").toString()) : BigDecimal.ZERO);
        reimbursement.setReason((String) reimbData.get("reason"));

        List<ReimbursementItem> items = new ArrayList<>();
        if (itemsData != null) {
            for (Map<String, Object> itemData : itemsData) {
                ReimbursementItem item = new ReimbursementItem();
                if (itemData.get("id") != null) {
                    item.setId(Long.valueOf(itemData.get("id").toString()));
                }
                item.setItemName((String) itemData.get("itemName"));
                item.setItemType((String) itemData.get("itemType"));
                item.setAmount(itemData.get("amount") != null ? new BigDecimal(itemData.get("amount").toString()) : BigDecimal.ZERO);
                item.setQuantity(itemData.get("quantity") != null ? Integer.valueOf(itemData.get("quantity").toString()) : 1);
                item.setUnitPrice(itemData.get("unitPrice") != null ? new BigDecimal(itemData.get("unitPrice").toString()) : BigDecimal.ZERO);
                if (itemData.get("expenseDate") != null) {
                    item.setExpenseDate(LocalDate.parse(itemData.get("expenseDate").toString()));
                }
                item.setDescription((String) itemData.get("description"));
                items.add(item);
            }
        }

        List<InvoiceAttachment> attachments = new ArrayList<>();
        if (attachmentsData != null) {
            for (Map<String, Object> attData : attachmentsData) {
                InvoiceAttachment attachment = new InvoiceAttachment();
                if (attData.get("id") != null) {
                    attachment.setId(Long.valueOf(attData.get("id").toString()));
                }
                attachment.setFileName((String) attData.get("fileName"));
                attachment.setFilePath((String) attData.get("filePath"));
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
    public Result<IPage<Reimbursement>> myReimbursements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        IPage<Reimbursement> result = reimbursementService.getMyReimbursements(userId, page, size);
        return Result.success(result);
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

        Map<String, Object> data = new HashMap<>();
        data.put("reimbursement", reimbursement);
        data.put("items", items);
        data.put("attachments", attachments);
        return Result.success(data);
    }
}