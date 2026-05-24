package com.example.complaint.repository;

import com.example.complaint.entity.ComplaintProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintProgressRepository extends JpaRepository<ComplaintProgress, Long> {

    List<ComplaintProgress> findByComplaintIdOrderByCreateTimeAsc(Long complaintId);
}
