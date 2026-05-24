package com.example.complaint.repository;

import com.example.complaint.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Long> {

    List<ComplaintCategory> findAll();
}
