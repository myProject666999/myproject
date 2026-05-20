package com.gamelibrary.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gamelibrary.entity.Game;
import com.gamelibrary.mapper.GameMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameService extends ServiceImpl<GameMapper, Game> {

    public List<Game> searchGames(String keyword) {
        QueryWrapper<Game> wrapper = new QueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like("name", keyword)
                    .or().like("genre", keyword)
                    .or().like("developer", keyword);
        }
        wrapper.orderByDesc("created_at");
        return list(wrapper);
    }

    public boolean addGame(Game game) {
        return save(game);
    }

    public boolean updateGame(Game game) {
        return updateById(game);
    }

    public boolean deleteGame(Long id) {
        return removeById(id);
    }
}
