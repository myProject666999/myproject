package com.carbon.emission.listener;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.carbon.emission.vo.EmissionDataImportVO;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class EmissionDataExcelListener extends AnalysisEventListener<EmissionDataImportVO> {

    private List<EmissionDataImportVO> successList;
    private List<String> errorList;

    public EmissionDataExcelListener(List<EmissionDataImportVO> successList, List<String> errorList) {
        this.successList = successList;
        this.errorList = errorList;
    }

    @Override
    public void invoke(EmissionDataImportVO data, AnalysisContext context) {
        try {
            if (validateData(data)) {
                successList.add(data);
            } else {
                errorList.add("第" + context.readRowHolder().getRowIndex() + "行数据校验失败");
            }
        } catch (Exception e) {
            errorList.add("第" + context.readRowHolder().getRowIndex() + "行数据异常：" + e.getMessage());
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        log.info("Excel解析完成，成功{}条，失败{}条", successList.size(), errorList.size());
    }

    private boolean validateData(EmissionDataImportVO data) {
        return data.getEmissionScope() != null
                && data.getSourceType() != null
                && data.getActivityName() != null
                && data.getActivityDate() != null
                && data.getQuantity() != null
                && data.getUnit() != null;
    }
}
