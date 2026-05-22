package com.fitness.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Data
public class RegisterDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
    private String nickname;
    private Integer gender;
    private Integer age;
    private BigDecimal height;
    private BigDecimal weight;
}
