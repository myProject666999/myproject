package com.gamelibrary.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gamelibrary.entity.UserGame;
import com.gamelibrary.mapper.UserGameMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserGameService extends ServiceImpl<UserGameMapper, UserGame> {

    public List<UserGame> getUserGames(Long userId) {
        QueryWrapper<UserGame> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("is_favorite", "last_played_at");
        return list(wrapper);
    }

    public UserGame getUserGameDetail(Long userId, Long gameId) {
        QueryWrapper<UserGame> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("game_id", gameId);
        return getOne(wrapper);
    }

    public boolean addUserGame(UserGame userGame) {
        return save(userGame);
    }

    public boolean updateUserGame(UserGame userGame) {
        return updateById(userGame);
    }

    public boolean updatePlayTime(Long userGameId, int minutes) {
        UserGame userGame = getById(userGameId);
        if (userGame != null) {
            userGame.setTotalPlayTime(userGame.getTotalPlayTime() + minutes);
            userGame.setLastPlayedAt(java.time.LocalDateTime.now());
            return updateById(userGame);
        }
        return false;
    }
}
