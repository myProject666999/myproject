package com.corporate.reimbursement.entity;

import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "invoice_attachment")
public class InvoiceAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "reimbursement_id")
    private Long reimbursementId;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(name = "invoice_code")
    private String invoiceCode;

    @Column(name = "invoice_amount")
    private BigDecimal invoiceAmount;

    @Column(name = "create_time")
    private LocalDateTime createTime;
}
