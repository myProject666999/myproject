package com.example.complaint.service;

import com.example.complaint.dto.ComplaintDetailDTO;
import com.example.complaint.dto.ComplaintSubmitDTO;
import com.example.complaint.entity.Complaint;
import com.example.complaint.entity.ComplaintCategory;
import com.example.complaint.entity.ComplaintFile;
import com.example.complaint.entity.ComplaintProgress;
import com.example.complaint.enums.ComplaintStatus;
import com.example.complaint.repository.ComplaintCategoryRepository;
import com.example.complaint.repository.ComplaintFileRepository;
import com.example.complaint.repository.ComplaintProgressRepository;
import com.example.complaint.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintProgressRepository progressRepository;
    private final ComplaintFileRepository fileRepository;
    private final ComplaintCategoryRepository categoryRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public Complaint submitComplaint(ComplaintSubmitDTO dto, List<MultipartFile> files) throws IOException {
        Complaint complaint = new Complaint();
        complaint.setTitle(dto.getTitle());
        complaint.setCategoryId(dto.getCategoryId());
        complaint.setArea(dto.getArea());
        complaint.setContent(dto.getContent());
        complaint.setContactName(dto.getContactName());
        complaint.setContactPhone(dto.getContactPhone());
        complaint.setStatus(ComplaintStatus.PENDING);
        complaint.setCreateTime(LocalDateTime.now());
        complaint.setUpdateTime(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        ComplaintProgress progress = new ComplaintProgress();
        progress.setComplaintId(saved.getId());
        progress.setStatus(ComplaintStatus.PENDING);
        progress.setDescription("投诉已提交，等待受理");
        progress.setHandler("系统");
        progress.setCreateTime(LocalDateTime.now());
        progressRepository.save(progress);

        if (files != null && !files.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            for (MultipartFile mf : files) {
                if (mf.isEmpty()) continue;
                String originalName = mf.getOriginalFilename();
                String ext = "";
                if (originalName != null && originalName.contains(".")) {
                    ext = originalName.substring(originalName.lastIndexOf("."));
                }
                String newName = UUID.randomUUID().toString().replace("-", "") + ext;
                Path dest = uploadPath.resolve(newName);
                mf.transferTo(dest.toFile());

                ComplaintFile cf = new ComplaintFile();
                cf.setComplaintId(saved.getId());
                cf.setFileName(originalName == null ? newName : originalName);
                cf.setFilePath(dest.toString());
                cf.setFileType(mf.getContentType());
                cf.setUploadTime(LocalDateTime.now());
                fileRepository.save(cf);
            }
        }

        return saved;
    }

    public List<Complaint> getMyComplaints(String contactPhone) {
        if (contactPhone == null || contactPhone.isBlank()) {
            return List.of();
        }
        List<Complaint> list = complaintRepository.findByContactPhoneOrderByCreateTimeDesc(contactPhone);
        fillCategoryName(list);
        return list;
    }

    private void fillCategoryName(List<Complaint> list) {
        if (list == null || list.isEmpty()) return;
        for (Complaint c : list) {
            if (c.getCategoryId() != null) {
                categoryRepository.findById(c.getCategoryId())
                        .ifPresent(cat -> c.setCategoryName(cat.getName()));
            }
        }
    }

    public ComplaintDetailDTO getDetail(Long id) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return null;
        }
        ComplaintDetailDTO dto = new ComplaintDetailDTO();
        dto.setId(complaint.getId());
        dto.setTitle(complaint.getTitle());
        dto.setCategoryId(complaint.getCategoryId());
        dto.setArea(complaint.getArea());
        dto.setContent(complaint.getContent());
        dto.setContactName(complaint.getContactName());
        dto.setContactPhone(complaint.getContactPhone());
        dto.setStatus(complaint.getStatus());
        dto.setStatusLabel(complaint.getStatus().getLabel());
        dto.setRating(complaint.getRating());
        dto.setFeedback(complaint.getFeedback());
        dto.setCreateTime(complaint.getCreateTime());
        dto.setUpdateTime(complaint.getUpdateTime());

        categoryRepository.findById(complaint.getCategoryId())
                .ifPresent(c -> dto.setCategoryName(c.getName()));

        dto.setProgressList(progressRepository.findByComplaintIdOrderByCreateTimeAsc(id));
        dto.setFileList(fileRepository.findByComplaintId(id));

        return dto;
    }

    @Transactional
    public boolean evaluateComplaint(Long id, Integer rating, String feedback) {
        if (rating == null || rating < 1 || rating > 5) {
            return false;
        }
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return false;
        }
        complaint.setRating(rating);
        complaint.setFeedback(feedback);
        complaint.setUpdateTime(LocalDateTime.now());
        complaintRepository.save(complaint);
        return true;
    }
}
