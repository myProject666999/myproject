package com.health.appointment.repository;

import com.health.appointment.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartmentIdAndStatus(Long departmentId, Integer status);
    List<Doctor> findByStatus(Integer status);
}
