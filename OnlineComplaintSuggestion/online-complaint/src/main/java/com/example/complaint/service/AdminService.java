package com.example.complaint.service;

import com.example.complaint.entity.Complaint;
import com.example.complaint.entity.ComplaintProgress;
import com.example.complaint.enums.ComplaintStatus;
import com.example.complaint.repository.ComplaintCategoryRepository;
import com.example.complaint.repository.ComplaintProgressRepository;
import com.example.complaint.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintProgressRepository progressRepository;
    private final ComplaintCategoryRepository categoryRepository;

    public List<Complaint> getAllComplaints() {
        List<Complaint> list = complaintRepository.findAllByOrderByCreateTimeDesc();
        fillCategoryName(list);
        return list;
    }

    public List<Complaint> getByStatus(ComplaintStatus status) {
        if (status == null) {
            return getAllComplaints();
        }
        List<Complaint> list = complaintRepository.findByStatus(status);
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

    @Transactional
    public boolean updateStatus(Long id, ComplaintStatus status, String description, String handler) {
        if (status == null) {
            return false;
        }
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return false;
        }
        complaint.setStatus(status);
        complaint.setUpdateTime(LocalDateTime.now());
        complaintRepository.save(complaint);

        ComplaintProgress progress = new ComplaintProgress();
        progress.setComplaintId(id);
        progress.setStatus(status);
        progress.setDescription(description);
        progress.setHandler(handler == null || handler.isBlank() ? "管理员" : handler);
        progress.setCreateTime(LocalDateTime.now());
        progressRepository.save(progress);

        return true;
    }
}
