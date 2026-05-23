package com.oj.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.dto.SubmitDTO;
import com.oj.entity.Submission;

public interface SubmissionService extends IService<Submission> {
    Submission submit(SubmitDTO submitDTO, Long userId);
    IPage<Submission> getSubmissionPage(int page, int size, Long userId, Long problemId, Long contestId, Integer status, String language);
    Submission getSubmissionDetail(Long id, Long userId);
    void updateSubmissionResult(Submission submission);
}
