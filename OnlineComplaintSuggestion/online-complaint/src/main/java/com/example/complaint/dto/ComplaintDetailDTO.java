package com.example.complaint.dto;

import com.example.complaint.entity.ComplaintFile;
import com.example.complaint.entity.ComplaintProgress;
import com.example.complaint.enums.ComplaintStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class ComplaintDetailDTO {

    private Long id;
    private String title;
    private Long categoryId;
    private String categoryName;
    private String area;
    private String content;
    private String contactName;
    private String contactPhone;
    private ComplaintStatus status;
    private String statusLabel;
    private Integer rating;
    private String feedback;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<ComplaintProgress> progressList = new ArrayList<>();
    private List<ComplaintFile> fileList = new ArrayList<>();
}
