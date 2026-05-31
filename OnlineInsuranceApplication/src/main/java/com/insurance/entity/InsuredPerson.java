package com.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "insured_persons")
public class InsuredPerson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String idCard;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private String gender;

    private String phone;
    private String email;
    private String address;

    @JsonIgnore
    @OneToOne(mappedBy = "insuredPerson")
    private InsurancePolicy policy;
}
