package com.example.resume.repository;

import com.example.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserId(Long userId);
    Optional<Resume> findByIdAndUserId(Long id, Long userId);
    List<Resume> findByIsPublicTrue();

    @Query("SELECT r FROM Resume r LEFT JOIN FETCH r.educations LEFT JOIN FETCH r.experiences LEFT JOIN FETCH r.projects LEFT JOIN FETCH r.skills WHERE r.id = :id")
    Optional<Resume> findByIdWithAllDetails(Long id);
}
