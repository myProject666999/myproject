package com.tcm.system.dto;

import com.tcm.system.entity.Prescription;
import com.tcm.system.entity.PrescriptionHerb;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionDTO {
    private Prescription prescription;
    private List<PrescriptionHerb> herbs;
}
