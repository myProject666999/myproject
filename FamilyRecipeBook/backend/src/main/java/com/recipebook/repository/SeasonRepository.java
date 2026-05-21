package com.recipebook.repository;

import com.recipebook.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeasonRepository extends JpaRepository<Season, Long> {

    Optional<Season> findByName(String name);

    java.util.List<Season> findAllByOrderByIdAsc();
}
