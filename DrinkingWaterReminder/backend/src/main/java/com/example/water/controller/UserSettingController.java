package com.example.water.controller;

import com.example.water.entity.UserSetting;
import com.example.water.service.UserSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/setting")
@CrossOrigin(origins = "*")
public class UserSettingController {

    @Autowired
    private UserSettingService userSettingService;

    @GetMapping
    public ResponseEntity<UserSetting> getSetting() {
        return ResponseEntity.ok(userSettingService.getUserSetting());
    }

    @PutMapping
    public ResponseEntity<UserSetting> updateSetting(@RequestBody UserSetting userSetting) {
        return ResponseEntity.ok(userSettingService.updateUserSetting(userSetting));
    }

    @PostMapping("/weight")
    public ResponseEntity<UserSetting> updateWeight(@RequestBody Map<String, BigDecimal> body) {
        BigDecimal weight = body.get("weight");
        return ResponseEntity.ok(userSettingService.updateWeight(weight));
    }

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateTarget(@RequestParam BigDecimal weight) {
        Integer target = userSettingService.calculateDailyTarget(weight);
        Map<String, Object> result = new HashMap<>();
        result.put("weight", weight);
        result.put("dailyTarget", target);
        return ResponseEntity.ok(result);
    }
}
