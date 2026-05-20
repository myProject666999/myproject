package com.gamelibrary.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.gamelibrary.entity.UserGame;
import com.gamelibrary.mapper.UserGameMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {

    @Autowired
    private UserGameMapper userGameMapper;

    public Map<String, Object> getUserStatistics(Long userId) {
        Map<String, Object> stats = new HashMap<>();

        List<UserGame> userGames = userGameMapper.selectList(
                new QueryWrapper<UserGame>().eq("user_id", userId)
        );

        int totalGames = userGames.size();
        int totalPlayTime = userGames.stream().mapToInt(UserGame::getTotalPlayTime).sum();

        long completedGames = userGames.stream().filter(ug -> ug.getCompletionStatus() != null && ug.getCompletionStatus() == 2).count();
        long inProgressGames = userGames.stream().filter(ug -> ug.getCompletionStatus() != null && ug.getCompletionStatus() == 1).count();
        long notStartedGames = userGames.stream().filter(ug -> ug.getCompletionStatus() != null && ug.getCompletionStatus() == 0).count();
        long favoriteGames = userGames.stream().filter(ug -> ug.getIsFavorite() != null && ug.getIsFavorite() == 1).count();

        stats.put("totalGames", totalGames);
        stats.put("totalPlayTime", totalPlayTime);
        stats.put("completedGames", completedGames);
        stats.put("inProgressGames", inProgressGames);
        stats.put("notStartedGames", notStartedGames);
        stats.put("favoriteGames", favoriteGames);

        return stats;
    }
}
