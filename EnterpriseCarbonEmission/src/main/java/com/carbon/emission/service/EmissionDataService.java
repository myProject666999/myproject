package com.carbon.emission.service;

import cn.hutool.core.util.StrUtil;
import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.EmissionData;
import com.carbon.emission.entity.EmissionFactor;
import com.carbon.emission.entity.ImportBatch;
import com.carbon.emission.listener.EmissionDataExcelListener;
import com.carbon.emission.mapper.EmissionDataMapper;
import com.carbon.emission.vo.EmissionDataImportVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmissionDataService extends ServiceImpl<EmissionDataMapper, EmissionData> {

    @Autowired
    private EmissionFactorService emissionFactorService;

    @Autowired
    private ImportBatchService importBatchService;

    public Page<EmissionData> getDataPage(Long orgId, Integer emissionScope, Integer sourceType, 
                                          String activityMonth, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<EmissionData> wrapper = new LambdaQueryWrapper<>();
        if (orgId != null) {
            wrapper.eq(EmissionData::getOrgId, orgId);
        }
        if (emissionScope != null) {
            wrapper.eq(EmissionData::getEmissionScope, emissionScope);
        }
        if (sourceType != null) {
            wrapper.eq(EmissionData::getSourceType, sourceType);
        }
        if (StrUtil.isNotBlank(activityMonth)) {
            wrapper.eq(EmissionData::getActivityMonth, activityMonth);
        }
        wrapper.orderByDesc(EmissionData::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean saveEmissionData(EmissionData data) {
        if (data.getFactorId() != null) {
            EmissionFactor factor = emissionFactorService.getById(data.getFactorId());
            if (factor != null) {
                data.setFactorVersion(factor.getVersion());
            }
        }
        if (data.getActivityDate() != null) {
            data.setActivityMonth(data.getActivityDate().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        }
        data.setDataNo(generateDataNo());
        return save(data);
    }

    @Transactional(rollbackFor = Exception.class)
    public ImportBatch batchImport(MultipartFile file, Long orgId, String createBy) throws IOException {
        String batchNo = generateBatchNo();
        ImportBatch batch = new ImportBatch();
        batch.setBatchNo(batchNo);
        batch.setBatchName("排放数据批量导入-" + LocalDate.now());
        batch.setImportType(1);
        batch.setOrgId(orgId);
        batch.setImportStatus(0);
        batch.setCreateBy(createBy);
        importBatchService.save(batch);

        List<EmissionDataImportVO> successList = new ArrayList<>();
        List<String> errorList = new ArrayList<>();

        try {
            EasyExcel.read(file.getInputStream(), EmissionDataImportVO.class, 
                    new EmissionDataExcelListener(successList, errorList)).sheet().doRead();

            batch.setTotalCount(successList.size() + errorList.size());
            batch.setSuccessCount(successList.size());
            batch.setFailCount(errorList.size());

            List<EmissionData> dataList = new ArrayList<>();
            for (EmissionDataImportVO vo : successList) {
                EmissionData data = convertToEntity(vo, orgId, batchNo, createBy);
                dataList.add(data);
            }

            if (!dataList.isEmpty()) {
                saveBatch(dataList);
            }

            batch.setImportStatus(errorList.isEmpty() ? 1 : (successList.isEmpty() ? 2 : 3));
            if (!errorList.isEmpty()) {
                batch.setErrorLog(String.join(";", errorList));
            }

        } catch (Exception e) {
            batch.setImportStatus(2);
            batch.setErrorLog("导入异常：" + e.getMessage());
            throw e;
        } finally {
            importBatchService.updateById(batch);
        }

        return batch;
    }

    private EmissionData convertToEntity(EmissionDataImportVO vo, Long orgId, String batchNo, String createBy) {
        EmissionData data = new EmissionData();
        data.setDataNo(generateDataNo());
        data.setOrgId(orgId);
        data.setEmissionScope(vo.getEmissionScope());
        data.setSourceType(vo.getSourceType());
        data.setSourceCategory(vo.getSourceCategory());
        data.setActivityName(vo.getActivityName());
        data.setActivityDate(LocalDate.parse(vo.getActivityDate()));
        data.setActivityMonth(LocalDate.parse(vo.getActivityDate()).format(DateTimeFormatter.ofPattern("yyyy-MM")));
        data.setQuantity(new BigDecimal(vo.getQuantity()));
        data.setUnit(vo.getUnit());
        data.setBatchNo(batchNo);
        data.setDataSource(2);
        data.setStatus(1);
        data.setCreateBy(createBy);
        return data;
    }

    private String generateDataNo() {
        return "ED" + System.currentTimeMillis();
    }

    private String generateBatchNo() {
        return "BATCH" + System.currentTimeMillis();
    }
}
