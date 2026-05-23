package com.survey.controller;

import com.survey.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    @GetMapping("/qrcode")
    public Result<Map<String, String>> qrcode(@RequestParam String url) {
        Map<String, String> data = new HashMap<>();
        data.put("url", url);
        return Result.success(data);
    }
}
