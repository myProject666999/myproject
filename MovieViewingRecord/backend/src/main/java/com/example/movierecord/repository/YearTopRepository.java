package com.example.movierecord.repository;

import com.example.movierecord.entity.YearTop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YearTopRepository extends JpaRepository<YearTop, Long> {

    List<YearTop> findByUserIdAndYearOrderByRankAsc(Long userId, Integer year);

    Optional<YearTop> findByUserIdAndYearAndRank(Long userId, Integer year, Integer rank);

    Optional<YearTop> findByUserIdAndYearAndMovieId(Long userId, Integer year, Long movieId);

    @Query("SELECT DISTINCT yt.year FROM YearTop yt WHERE yt.userId = :userId ORDER BY yt.year DESC")
    List<Integer> findYearsByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndYear(Long userId, Integer year);
}
