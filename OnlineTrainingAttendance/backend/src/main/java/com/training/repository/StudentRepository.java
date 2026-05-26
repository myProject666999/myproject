package com.training.repository;

import com.training.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByIdCard(String idCard);

    Optional<Student> findByPhone(String phone);

    Optional<Student> findByEmail(String email);

    List<Student> findByNameContaining(String name);

    List<Student> findByGender(Integer gender);

    List<Student> findByNameContainingAndGender(String name, Integer gender);

    boolean existsByIdCard(String idCard);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}
