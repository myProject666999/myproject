package com.training.repository;

import com.training.entity.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {

    List<Training> findByNameContaining(String name);

    List<Training> findByStatus(Integer status);

    List<Training> findByNameContainingAndStatus(String name, Integer status);

    List<Training> findByInstructorContaining(String instructor);

    List<Training> findByCreatedBy(Long createdBy);

    @Query("SELECT t FROM Training t WHERE t.startDate <= :today AND t.endDate >= :today")
    List<Training> findOngoingTrainings(@Param("today") LocalDate today);

    @Query("SELECT t FROM Training t WHERE t.endDate < :today")
    List<Training> findEndedTrainings(@Param("today") LocalDate today);

    @Query("SELECT t FROM Training t WHERE t.startDate > :today")
    List<Training> findUpcomingTrainings(@Param("today") LocalDate today);
}
