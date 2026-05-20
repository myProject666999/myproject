package com.booklist.repository;

import com.booklist.entity.ReadingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReadingRecordRepository extends JpaRepository<ReadingRecord, Long> {
    List<ReadingRecord> findByBookListIdOrderByReadDateDesc(Long bookListId);

    @Query("SELECT rr FROM ReadingRecord rr WHERE rr.bookListId = :bookListId AND rr.readDate BETWEEN :startDate AND :endDate ORDER BY rr.readDate")
    List<ReadingRecord> findByBookListIdAndDateRange(@Param("bookListId") Long bookListId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    @Query("SELECT rr FROM ReadingRecord rr WHERE rr.readDate BETWEEN :startDate AND :endDate ORDER BY rr.readDate")
    List<ReadingRecord> findByDateRange(@Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(rr.durationMinutes), 0) FROM ReadingRecord rr WHERE rr.readDate BETWEEN :startDate AND :endDate")
    Integer sumDurationByDateRange(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(rr.durationMinutes), 0) FROM ReadingRecord rr WHERE rr.bookListId = :bookListId")
    Integer sumDurationByBookListId(@Param("bookListId") Long bookListId);
}
