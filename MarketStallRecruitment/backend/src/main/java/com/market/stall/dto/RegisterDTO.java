package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterDTO {

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String realName;

    @NotBlank
    private String phone;

    private String email;

    private Integer role;
}
