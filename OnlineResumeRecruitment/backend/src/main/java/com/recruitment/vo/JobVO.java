package com.recruitment.vo;

import com.recruitment.entity.Company;
import com.recruitment.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobVO {

    private Job job;

    private Company company;
}
