package com.example.movierecord.repository;

import com.example.movierecord.entity.ViewingRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViewingRecordRepository extends JpaRepository<ViewingRecord, Long> {

    Optional<ViewingRecord> findByUserIdAndMovieId(Long userId, Long movieId);

    List<ViewingRecord> findByUserIdAndStatus(Long userId, String status);

    @Query("SELECT vr FROM ViewingRecord vr WHERE vr.userId = :userId " +
           "AND (:status IS NULL OR vr.status = :status) " +
           "AND (:keyword IS NULL OR EXISTS (SELECT 1 FROM Movie m WHERE m.id = vr.movieId AND (m.title LIKE %:keyword% OR m.originalTitle LIKE %:keyword%))) " +
           "ORDER BY vr.updatedAt DESC")
    Page<ViewingRecord> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT DISTINCT YEAR(vr.watchDate) FROM ViewingRecord vr " +
           "WHERE vr.userId = :userId AND vr.watchDate IS NOT NULL " +
           "ORDER BY YEAR(vr.watchDate) DESC")
    List<Integer> findWatchYearsByUserId(@Param("userId") Long userId);
}
