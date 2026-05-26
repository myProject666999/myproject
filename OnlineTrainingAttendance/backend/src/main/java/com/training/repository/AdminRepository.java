package com.training.repository;

import com.training.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsername(String username);

    List<Admin> findByNameContaining(String name);

    List<Admin> findByStatus(Integer status);

    List<Admin> findByNameContainingAndStatus(String name, Integer status);

    boolean existsByUsername(String username);
}
