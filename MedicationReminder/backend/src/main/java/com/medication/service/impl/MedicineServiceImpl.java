package com.medication.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.medication.entity.Medicine;
import com.medication.mapper.MedicineMapper;
import com.medication.service.MedicineService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MedicineServiceImpl extends ServiceImpl<MedicineMapper, Medicine> implements MedicineService {

    @Override
    public List<Medicine> listAll() {
        return list();
    }
}
