package com.recruitment.vo;

import com.recruitment.entity.Company;
import com.recruitment.entity.Job;
import com.recruitment.entity.JobApplication;
import com.recruitment.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationVO {

    private JobApplication application;

    private Job job;

    private Company company;

    private User applicant;
}
