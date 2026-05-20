package com.gamelibrary.controller;

import com.gamelibrary.common.Result;
import com.gamelibrary.entity.Game;
import com.gamelibrary.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@CrossOrigin
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    public Result<List<Game>> getGames(@RequestParam(required = false) String keyword) {
        return Result.success(gameService.searchGames(keyword));
    }

    @GetMapping("/{id}")
    public Result<Game> getGameById(@PathVariable Long id) {
        return Result.success(gameService.getById(id));
    }

    @PostMapping
    public Result<Boolean> addGame(@RequestBody Game game) {
        return Result.success(gameService.addGame(game));
    }

    @PutMapping
    public Result<Boolean> updateGame(@RequestBody Game game) {
        return Result.success(gameService.updateGame(game));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteGame(@PathVariable Long id) {
        return Result.success(gameService.deleteGame(id));
    }
}
