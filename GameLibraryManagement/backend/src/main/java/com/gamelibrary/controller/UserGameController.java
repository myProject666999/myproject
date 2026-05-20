package com.gamelibrary.controller;

import com.gamelibrary.common.Result;
import com.gamelibrary.entity.UserGame;
import com.gamelibrary.service.UserGameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-games")
@CrossOrigin
public class UserGameController {

    @Autowired
    private UserGameService userGameService;

    @GetMapping("/user/{userId}")
    public Result<List<UserGame>> getUserGames(@PathVariable Long userId) {
        return Result.success(userGameService.getUserGames(userId));
    }

    @GetMapping("/{userId}/{gameId}")
    public Result<UserGame> getUserGameDetail(@PathVariable Long userId, @PathVariable Long gameId) {
        return Result.success(userGameService.getUserGameDetail(userId, gameId));
    }

    @PostMapping
    public Result<Boolean> addUserGame(@RequestBody UserGame userGame) {
        return Result.success(userGameService.addUserGame(userGame));
    }

    @PutMapping
    public Result<Boolean> updateUserGame(@RequestBody UserGame userGame) {
        return Result.success(userGameService.updateUserGame(userGame));
    }

    @PostMapping("/{userGameId}/add-playtime")
    public Result<Boolean> addPlayTime(@PathVariable Long userGameId, @RequestParam int minutes) {
        return Result.success(userGameService.updatePlayTime(userGameId, minutes));
    }
}
