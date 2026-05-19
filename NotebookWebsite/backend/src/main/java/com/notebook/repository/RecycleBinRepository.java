package com.notebook.repository;

import com.notebook.entity.RecycleBin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecycleBinRepository extends JpaRepository<RecycleBin, Long> {
    List<RecycleBin> findAllByOrderByDeletedAtDesc();
}
