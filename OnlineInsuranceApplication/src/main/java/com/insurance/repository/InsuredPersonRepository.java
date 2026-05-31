package com.insurance.repository;

import com.insurance.entity.InsuredPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsuredPersonRepository extends JpaRepository<InsuredPerson, Long> {
    Optional<InsuredPerson> findByIdCard(String idCard);
}
