package com.training.repository;

import com.training.entity.TrainingStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingStudentRepository extends JpaRepository<TrainingStudent, Long> {

    Optional<TrainingStudent> findByTrainingIdAndStudentId(Long trainingId, Long studentId);

    List<TrainingStudent> findByTrainingId(Long trainingId);

    List<TrainingStudent> findByStudentId(Long studentId);

    List<TrainingStudent> findByTrainingIdAndIsCompleted(Long trainingId, Integer isCompleted);

    List<TrainingStudent> findByStudentIdAndIsCompleted(Long studentId, Integer isCompleted);

    List<TrainingStudent> findByIsCompleted(Integer isCompleted);

    long countByTrainingId(Long trainingId);

    long countByTrainingIdAndIsCompleted(Long trainingId, Integer isCompleted);

    boolean existsByTrainingIdAndStudentId(Long trainingId, Long studentId);

    void deleteByTrainingIdAndStudentId(Long trainingId, Long studentId);
}
