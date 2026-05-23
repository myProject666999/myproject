package com.oj.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.Contest;
import com.oj.entity.ContestUser;

import java.util.List;

public interface ContestService extends IService<Contest> {
    IPage<Contest> getContestPage(int page, int size, String keyword, Integer status);
    Contest getContestDetail(Long contestId, Long userId);
    Contest createContest(Contest contest);
    Contest updateContest(Contest contest);
    void deleteContest(Long contestId);
    void joinContest(Long contestId, Long userId, String password);
    List<ContestUser> getContestRank(Long contestId);
    void updateContestStatus();
}
