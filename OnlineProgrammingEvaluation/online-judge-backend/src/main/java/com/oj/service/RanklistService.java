package com.oj.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.oj.common.Constants;
import com.oj.entity.Submission;
import com.oj.entity.User;
import com.oj.entity.UserProblemAc;
import com.oj.util.RedisUtil;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class RanklistService {

    @Resource
    private RedisUtil redisUtil;

    @Resource
    private UserService userService;

    @Resource
    private UserProblemAcService userProblemAcService;

    @Resource
    private SubmissionService submissionService;

    public void refreshRanklist() {
        List<User> users = userService.list(new LambdaQueryWrapper<User>().eq(User::getStatus, 1));
        for (User user : users) {
            double score = calculateScore(user);
            redisUtil.zAdd(Constants.RedisKey.RANKLIST, user.getId(), score);
        }
    }

    public List<Map<String, Object>> getRanklist(int page, int size) {
        long start = (long) (page - 1) * size;
        long end = start + size - 1;
        Set<Object> rankedIds = redisUtil.zRevRange(Constants.RedisKey.RANKLIST, start, end);
        if (rankedIds == null || rankedIds.isEmpty()) {
            refreshRanklist();
            rankedIds = redisUtil.zRevRange(Constants.RedisKey.RANKLIST, start, end);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        if (rankedIds != null) {
            int rank = (page - 1) * size + 1;
            for (Object idObj : rankedIds) {
                Long userId = Long.parseLong(idObj.toString());
                User user = userService.getById(userId);
                if (user != null) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("rank", rank++);
                    item.put("userId", user.getId());
                    item.put("username", user.getUsername());
                    item.put("nickname", user.getNickname());
                    item.put("avatar", user.getAvatar());
                    item.put("solvedCount", user.getSolvedCount());
                    item.put("submitCount", user.getSubmitCount());
                    item.put("rating", user.getRating());
                    Double score = redisUtil.zScore(Constants.RedisKey.RANKLIST, userId);
                    item.put("score", score != null ? score.intValue() : 0);
                    result.add(item);
                }
            }
        }
        return result;
    }

    public void updateUserRank(Long userId) {
        User user = userService.getById(userId);
        if (user != null) {
            double score = calculateScore(user);
            redisUtil.zAdd(Constants.RedisKey.RANKLIST, userId, score);
        }
    }

    private double calculateScore(User user) {
        int solvedCount = user.getSolvedCount() != null ? user.getSolvedCount() : 0;
        int submitCount = user.getSubmitCount() != null ? user.getSubmitCount() : 0;
        int rating = user.getRating() != null ? user.getRating() : 1500;
        double acRate = submitCount > 0 ? (double) solvedCount / submitCount : 0;
        return solvedCount * 1000.0 + acRate * 500.0 + (rating - 1500) * 10.0;
    }

    public Long getRanklistSize() {
        return redisUtil.zCard(Constants.RedisKey.RANKLIST);
    }
}
