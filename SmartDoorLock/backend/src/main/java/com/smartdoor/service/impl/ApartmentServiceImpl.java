package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.ApartmentQueryDTO;
import com.smartdoor.entity.Apartment;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.ApartmentMapper;
import com.smartdoor.service.ApartmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ApartmentServiceImpl extends ServiceImpl<ApartmentMapper, Apartment> implements ApartmentService {
    private static final Logger log = LoggerFactory.getLogger(ApartmentServiceImpl.class);

    @Override
    public Result<PageResult<Apartment>> getApartmentPage(ApartmentQueryDTO queryDTO) {
        LambdaQueryWrapper<Apartment> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getApartmentNo())) {
            wrapper.like(Apartment::getApartmentNo, queryDTO.getApartmentNo());
        }
        if (StringUtils.hasText(queryDTO.getBuilding())) {
            wrapper.eq(Apartment::getBuilding, queryDTO.getBuilding());
        }
        if (StringUtils.hasText(queryDTO.getFloor())) {
            wrapper.eq(Apartment::getFloor, queryDTO.getFloor());
        }
        if (StringUtils.hasText(queryDTO.getRoomType())) {
            wrapper.eq(Apartment::getRoomType, queryDTO.getRoomType());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            wrapper.eq(Apartment::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getMinRent() != null) {
            wrapper.ge(Apartment::getMonthlyRent, queryDTO.getMinRent());
        }
        if (queryDTO.getMaxRent() != null) {
            wrapper.le(Apartment::getMonthlyRent, queryDTO.getMaxRent());
        }
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Apartment::getApartmentNo, queryDTO.getKeyword())
                    .or().like(Apartment::getAddress, queryDTO.getKeyword())
                    .or().like(Apartment::getRoomNo, queryDTO.getKeyword()));
        }

        wrapper.orderByDesc(Apartment::getCreateTime);

        Page<Apartment> page = this.page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(),
                queryDTO.getPageNum(), queryDTO.getPageSize()));
    }

    @Override
    public Result<Apartment> getApartmentDetail(Long id) {
        Apartment apartment = this.getById(id);
        if (apartment == null) {
            throw new BusinessException("房源不存在");
        }
        return Result.success(apartment);
    }

    @Override
    public Result<Void> addApartment(Apartment apartment) {
        LambdaQueryWrapper<Apartment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Apartment::getApartmentNo, apartment.getApartmentNo());
        if (this.count(wrapper) > 0) {
            throw new BusinessException("房源编号已存在");
        }

        if (!StringUtils.hasText(apartment.getStatus())) {
            apartment.setStatus("VACANT");
        }

        this.save(apartment);
        log.info("新增房源成功: {}", apartment.getApartmentNo());
        return Result.success();
    }

    @Override
    public Result<Void> updateApartment(Apartment apartment) {
        Apartment exist = this.getById(apartment.getId());
        if (exist == null) {
            throw new BusinessException("房源不存在");
        }

        if (!exist.getApartmentNo().equals(apartment.getApartmentNo())) {
            LambdaQueryWrapper<Apartment> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Apartment::getApartmentNo, apartment.getApartmentNo());
            if (this.count(wrapper) > 0) {
                throw new BusinessException("房源编号已存在");
            }
        }

        this.updateById(apartment);
        log.info("更新房源成功: {}", apartment.getApartmentNo());
        return Result.success();
    }

    @Override
    public Result<Void> deleteApartment(Long id) {
        Apartment apartment = this.getById(id);
        if (apartment == null) {
            throw new BusinessException("房源不存在");
        }

        if ("OCCUPIED".equals(apartment.getStatus())) {
            throw new BusinessException("已出租房源不能删除");
        }

        this.removeById(id);
        log.info("删除房源成功: {}", apartment.getApartmentNo());
        return Result.success();
    }

    @Override
    public Result<Void> updateApartmentStatus(Long id, String status) {
        Apartment apartment = this.getById(id);
        if (apartment == null) {
            throw new BusinessException("房源不存在");
        }

        apartment.setStatus(status);
        this.updateById(apartment);
        log.info("更新房源状态成功: {}, status: {}", apartment.getApartmentNo(), status);
        return Result.success();
    }
}
