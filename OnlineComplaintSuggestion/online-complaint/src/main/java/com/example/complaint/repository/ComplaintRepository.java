package com.example.complaint.repository;

import com.example.complaint.entity.Complaint;
import com.example.complaint.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByCategoryId(Long categoryId);

    List<Complaint> findByArea(String area);

    List<Complaint> findAllByOrderByCreateTimeDesc();

    List<Complaint> findByContactPhoneOrderByCreateTimeDesc(String contactPhone);

    long countByStatus(ComplaintStatus status);
}
