package com.example.resume.repository;

import com.example.resume.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByIsActiveTrue();
    Optional<Template> findByCode(String code);
}
