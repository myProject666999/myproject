package com.carbon.emission.vo;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class EmissionDataImportVO {

    @ExcelProperty("排放范围")
    private Integer emissionScope;

    @ExcelProperty("排放源类型")
    private Integer sourceType;

    @ExcelProperty("排放源分类")
    private String sourceCategory;

    @ExcelProperty("活动名称")
    private String activityName;

    @ExcelProperty("活动日期")
    private String activityDate;

    @ExcelProperty("数量")
    private String quantity;

    @ExcelProperty("单位")
    private String unit;
}
