package com.booklist.repository;

import com.booklist.entity.BookList;
import com.booklist.entity.BookListStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookListRepository extends JpaRepository<BookList, Long> {
    List<BookList> findByStatus(BookListStatus status);
    List<BookList> findByStatusOrderByCreatedAtDesc(BookListStatus status);

    @Query("SELECT bl FROM BookList bl WHERE bl.status = 'FINISHED' AND bl.endDate BETWEEN :startDate AND :endDate")
    List<BookList> findFinishedBooksByYear(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT bl FROM BookList bl WHERE bl.status = 'READING' AND bl.startDate <= :endDate")
    List<BookList> findReadingBooksByYear(@Param("endDate") LocalDate endDate);

    long countByStatus(BookListStatus status);
}
