package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.ApartmentQueryDTO;
import com.smartdoor.entity.Apartment;

public interface ApartmentService extends IService<Apartment> {
    Result<PageResult<Apartment>> getApartmentPage(ApartmentQueryDTO queryDTO);
    Result<Apartment> getApartmentDetail(Long id);
    Result<Void> addApartment(Apartment apartment);
    Result<Void> updateApartment(Apartment apartment);
    Result<Void> deleteApartment(Long id);
    Result<Void> updateApartmentStatus(Long id, String status);
}
