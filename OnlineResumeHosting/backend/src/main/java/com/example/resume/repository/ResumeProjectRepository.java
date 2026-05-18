package com.example.resume.repository;

import com.example.resume.entity.ResumeProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeProjectRepository extends JpaRepository<ResumeProject, Long> {
    List<ResumeProject> findByResumeIdOrderBySortOrderAsc(Long resumeId);
    void deleteByResumeId(Long resumeId);
}
