package com.example.complaint.repository;

import com.example.complaint.entity.ComplaintFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintFileRepository extends JpaRepository<ComplaintFile, Long> {

    List<ComplaintFile> findByComplaintId(Long complaintId);
}
