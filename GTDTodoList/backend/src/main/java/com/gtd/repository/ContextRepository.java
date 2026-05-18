package com.gtd.repository;

import com.gtd.entity.Context;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContextRepository extends JpaRepository<Context, Long> {
    List<Context> findByUserIdOrderByCreatedAtDesc(Long userId);
}
