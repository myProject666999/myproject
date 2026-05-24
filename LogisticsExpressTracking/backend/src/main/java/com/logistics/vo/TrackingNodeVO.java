package com.logistics.vo;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class TrackingNodeVO implements Serializable {
    private Long id;
    private Integer nodeType;
    private String nodeTypeText;
    private String location;
    private String description;
    private String operator;
    private String operatorPhone;
    private LocalDateTime nodeTime;
}
