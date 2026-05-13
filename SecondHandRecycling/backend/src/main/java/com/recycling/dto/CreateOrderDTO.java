package com.recycling.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateOrderDTO {
    @NotNull(message = "品类ID不能为空")
    private Long categoryId;
    
    @NotNull(message = "地址ID不能为空")
    private Long addressId;
    
    private BigDecimal quantity;
    private BigDecimal estimatedPrice;
    private String description;
    private List<String> images;
    
    @NotNull(message = "预约时间不能为空")
    private LocalDateTime appointmentTime;
}
