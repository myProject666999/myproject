package com.chess.dto;

import lombok.Data;

import java.util.List;

@Data
public class MergeTableDTO {
    private Long targetOrderId;
    private List<Long> sourceOrderIds;
}
