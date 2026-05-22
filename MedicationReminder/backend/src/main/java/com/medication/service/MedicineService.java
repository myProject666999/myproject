package com.medication.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.medication.entity.Medicine;
import java.util.List;

public interface MedicineService extends IService<Medicine> {
    List<Medicine> listAll();
}
