package com.example.movierecord.repository;

import com.example.movierecord.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findByTitleAndYearAndType(String title, Integer year, String type);

    Optional<Movie> findByDoubanId(String doubanId);

    Optional<Movie> findByImdbId(String imdbId);

    @Query("SELECT m FROM Movie m WHERE " +
           "(:keyword IS NULL OR m.title LIKE %:keyword% OR m.originalTitle LIKE %:keyword%) " +
           "AND (:type IS NULL OR m.type = :type) " +
           "AND (:year IS NULL OR m.year = :year) " +
           "ORDER BY m.createdAt DESC")
    Page<Movie> searchMovies(
            @Param("keyword") String keyword,
            @Param("type") String type,
            @Param("year") Integer year,
            Pageable pageable);

    @Query("SELECT DISTINCT m.year FROM Movie m WHERE m.year IS NOT NULL ORDER BY m.year DESC")
    List<Integer> findAllYears();
}
