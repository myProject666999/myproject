package com.health.appointment.service;

import com.health.appointment.entity.Department;
import com.health.appointment.entity.Doctor;
import com.health.appointment.repository.DepartmentRepository;
import com.health.appointment.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Doctor> getDoctorsByDepartment(Long departmentId) {
        List<Doctor> doctors = doctorRepository.findByDepartmentIdAndStatus(departmentId, 1);
        doctors.forEach(this::loadDepartment);
        return doctors;
    }

    public List<Doctor> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findByStatus(1);
        doctors.forEach(this::loadDepartment);
        return doctors;
    }

    public Doctor getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id).orElse(null);
        if (doctor != null) {
            loadDepartment(doctor);
        }
        return doctor;
    }

    private void loadDepartment(Doctor doctor) {
        if (doctor.getDepartmentId() != null) {
            Department department = departmentRepository.findById(doctor.getDepartmentId()).orElse(null);
            doctor.setDepartment(department);
        }
    }
}
