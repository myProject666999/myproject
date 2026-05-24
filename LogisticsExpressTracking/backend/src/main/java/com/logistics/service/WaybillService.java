package com.logistics.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.logistics.dto.WaybillCreateDTO;
import com.logistics.dto.WaybillQueryDTO;
import com.logistics.entity.Waybill;
import com.logistics.vo.WaybillDetailVO;

public interface WaybillService extends IService<Waybill> {

    String createWaybill(WaybillCreateDTO dto);

    WaybillDetailVO getWaybillDetail(String waybillNo);

    IPage<Waybill> queryWaybills(WaybillQueryDTO dto);

    boolean updateWaybillStatus(Long id, Integer status);

    boolean updateWaybill(Waybill waybill);
}
