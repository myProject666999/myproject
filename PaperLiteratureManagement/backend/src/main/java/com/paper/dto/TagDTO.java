package com.paper.dto;

import lombok.Data;

@Data
public class TagDTO {
    private Long id;
    private String name;
    private String color;
    private Integer paperCount;
}
