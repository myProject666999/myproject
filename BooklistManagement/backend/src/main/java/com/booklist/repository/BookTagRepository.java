package com.booklist.repository;

import com.booklist.entity.BookTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookTagRepository extends JpaRepository<BookTag, Long> {
    List<BookTag> findByBookListId(Long bookListId);

    @Query("SELECT bt FROM BookTag bt JOIN FETCH bt.tag WHERE bt.bookListId = :bookListId")
    List<BookTag> findByBookListIdWithTag(@Param("bookListId") Long bookListId);

    Optional<BookTag> findByBookListIdAndTagId(Long bookListId, Long tagId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BookTag bt WHERE bt.bookListId = :bookListId")
    void deleteByBookListId(@Param("bookListId") Long bookListId);
}
