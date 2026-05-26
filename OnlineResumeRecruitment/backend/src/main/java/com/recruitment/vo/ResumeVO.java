package com.recruitment.vo;

import com.recruitment.entity.EducationExperience;
import com.recruitment.entity.ProjectExperience;
import com.recruitment.entity.Resume;
import com.recruitment.entity.WorkExperience;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeVO {

    private Resume resume;

    private List<WorkExperience> workExperiences;

    private List<EducationExperience> educationExperiences;

    private List<ProjectExperience> projectExperiences;
}
