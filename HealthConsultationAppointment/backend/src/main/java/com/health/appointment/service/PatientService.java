package com.health.appointment.service;

import com.health.appointment.entity.Patient;
import com.health.appointment.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    public Patient getPatientByPhone(String phone) {
        return patientRepository.findByPhone(phone).orElse(null);
    }

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient getOrCreatePatient(String phone, String name) {
        Patient patient = patientRepository.findByPhone(phone).orElse(null);
        if (patient == null) {
            patient = new Patient();
            patient.setPhone(phone);
            patient.setName(name);
            patient = patientRepository.save(patient);
        }
        return patient;
    }
}
