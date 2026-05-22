package com.runningroute.controller;

import com.runningroute.common.Result;
import com.runningroute.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/favorite")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/toggle")
    public Result<String> toggle(@RequestParam Long userId, @RequestParam Long routeId) {
        boolean result = favoriteService.toggleFavorite(userId, routeId);
        if (result) {
            return Result.success("操作成功");
        }
        return Result.error("操作失败");
    }

    @GetMapping("/check")
    public Result<Map<String, Boolean>> check(@RequestParam Long userId, @RequestParam Long routeId) {
        boolean isFavorited = favoriteService.isFavorited(userId, routeId);
        Map<String, Boolean> map = new HashMap<>();
        map.put("isFavorited", isFavorited);
        return Result.success(map);
    }
}
