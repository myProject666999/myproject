package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.ApartmentQueryDTO;
import com.smartdoor.entity.Apartment;
import com.smartdoor.service.ApartmentService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "房源管理")
@RestController
@RequestMapping("/apartment")
public class ApartmentController {

    @Autowired
    private ApartmentService apartmentService;

    @ApiOperation("分页查询房源列表")
    @GetMapping("/page")
    public Result<PageResult<Apartment>> getApartmentPage(ApartmentQueryDTO queryDTO) {
        return apartmentService.getApartmentPage(queryDTO);
    }

    @ApiOperation("获取房源详情")
    @GetMapping("/{id}")
    public Result<Apartment> getApartmentDetail(@PathVariable Long id) {
        return apartmentService.getApartmentDetail(id);
    }

    @ApiOperation("获取所有房源列表")
    @GetMapping("/list")
    public Result<List<Apartment>> getApartmentList() {
        return Result.success(apartmentService.list());
    }

    @ApiOperation("新增房源")
    @PostMapping
    public Result<Void> addApartment(@RequestBody Apartment apartment) {
        return apartmentService.addApartment(apartment);
    }

    @ApiOperation("更新房源")
    @PutMapping
    public Result<Void> updateApartment(@RequestBody Apartment apartment) {
        return apartmentService.updateApartment(apartment);
    }

    @ApiOperation("删除房源")
    @DeleteMapping("/{id}")
    public Result<Void> deleteApartment(@PathVariable Long id) {
        return apartmentService.deleteApartment(id);
    }

    @ApiOperation("更新房源状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateApartmentStatus(@PathVariable Long id, @RequestParam String status) {
        return apartmentService.updateApartmentStatus(id, status);
    }
}
