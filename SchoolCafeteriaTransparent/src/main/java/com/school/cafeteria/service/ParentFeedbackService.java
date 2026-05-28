package com.school.cafeteria.service;

import com.school.cafeteria.entity.ParentFeedback;
import com.school.cafeteria.repository.ParentFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ParentFeedbackService {

    @Autowired
    private ParentFeedbackRepository parentFeedbackRepository;

    public ParentFeedback save(ParentFeedback feedback) {
        return parentFeedbackRepository.save(feedback);
    }

    public Optional<ParentFeedback> findById(Long id) {
        return parentFeedbackRepository.findById(id);
    }

    public List<ParentFeedback> findByParentId(Long parentId) {
        return parentFeedbackRepository.findByParentId(parentId);
    }

    public List<ParentFeedback> findByStatus(String status) {
        return parentFeedbackRepository.findByStatus(status);
    }

    public List<ParentFeedback> findByType(String feedbackType) {
        return parentFeedbackRepository.findByFeedbackType(feedbackType);
    }

    public List<ParentFeedback> findPublicFeedbacks() {
        return parentFeedbackRepository.findByIsPublic(1);
    }

    public List<ParentFeedback> findAll() {
        return parentFeedbackRepository.findAll();
    }

    public ParentFeedback reply(Long id, String replyContent, String replyPerson) {
        Optional<ParentFeedback> optional = parentFeedbackRepository.findById(id);
        if (optional.isPresent()) {
            ParentFeedback feedback = optional.get();
            feedback.setReplyContent(replyContent);
            feedback.setReplyPerson(replyPerson);
            feedback.setReplyTime(LocalDateTime.now());
            feedback.setStatus("REPLIED");
            return parentFeedbackRepository.save(feedback);
        }
        return null;
    }

    public ParentFeedback updateStatus(Long id, String status) {
        Optional<ParentFeedback> optional = parentFeedbackRepository.findById(id);
        if (optional.isPresent()) {
            ParentFeedback feedback = optional.get();
            feedback.setStatus(status);
            return parentFeedbackRepository.save(feedback);
        }
        return null;
    }

    public Map<String, Object> getFeedbackStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingCount", parentFeedbackRepository.countByStatus("PENDING"));
        stats.put("processingCount", parentFeedbackRepository.countByStatus("PROCESSING"));
        stats.put("repliedCount", parentFeedbackRepository.countByStatus("REPLIED"));
        stats.put("closedCount", parentFeedbackRepository.countByStatus("CLOSED"));
        return stats;
    }

    public void delete(Long id) {
        parentFeedbackRepository.deleteById(id);
    }
}
