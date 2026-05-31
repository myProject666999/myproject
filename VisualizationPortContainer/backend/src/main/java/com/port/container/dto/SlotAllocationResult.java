package com.port.container.dto;

import com.port.container.entity.YardSlot;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class SlotAllocationResult implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long slotId;

    private String slotCode;

    private BigDecimal score;

    private Integer estimatedRehandles;

    private String strategyName;

    private String remarks;

    private String reason;

    private Long yardId;

    private Integer rowNo;

    private Integer bayNo;

    private Integer tierNo;

    private YardSlot selectedSlot;

    public void setSelectedSlot(YardSlot slot) {
        this.selectedSlot = slot;
        if (slot != null) {
            this.slotId = slot.getId();
            this.slotCode = slot.getSlotCode();
            this.yardId = slot.getYardId();
            this.rowNo = slot.getRowNum();
            this.bayNo = slot.getBayNum();
            this.tierNo = slot.getTierNum();
        }
    }
}
