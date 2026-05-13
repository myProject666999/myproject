package com.chess.dto;

import lombok.Data;

@Data
public class TransferTableDTO {
    private Long orderId;
    private Long fromTableId;
    private Long toTableId;
}
