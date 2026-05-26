package com.training.repository;

import com.training.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByCertificateNo(String certificateNo);

    Optional<Certificate> findByVerifyCode(String verifyCode);

    List<Certificate> findByTrainingId(Long trainingId);

    List<Certificate> findByStudentId(Long studentId);

    Optional<Certificate> findByTrainingIdAndStudentId(Long trainingId, Long studentId);

    List<Certificate> findByStudentNameContaining(String studentName);

    List<Certificate> findByTrainingNameContaining(String trainingName);

    List<Certificate> findByIsValid(Integer isValid);

    List<Certificate> findByIssueDateBetween(LocalDate startDate, LocalDate endDate);

    List<Certificate> findByStudentIdAndIsValid(Long studentId, Integer isValid);

    List<Certificate> findByTrainingIdAndIsValid(Long trainingId, Integer isValid);

    boolean existsByCertificateNo(String certificateNo);

    boolean existsByVerifyCode(String verifyCode);

    boolean existsByTrainingIdAndStudentId(Long trainingId, Long studentId);
}
