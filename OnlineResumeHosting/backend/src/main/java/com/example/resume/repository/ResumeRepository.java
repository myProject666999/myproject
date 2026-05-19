package com.example.resume.repository;

import com.example.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserId(Long userId);
    Optional<Resume> findByIdAndUserId(Long id, Long userId);
    List<Resume> findByIsPublicTrue();
}
