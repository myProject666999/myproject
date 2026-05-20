package com.itinerary.controller;

import com.itinerary.common.Result;
import com.itinerary.entity.Share;
import com.itinerary.service.ShareService;
import com.itinerary.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/share")
@CrossOrigin
public class ShareController {

    @Autowired
    private ShareService shareService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public Result<Share> createShare(@RequestBody Map<String, Object> request,
                                     @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        Long itineraryId = Long.valueOf(request.get("itineraryId").toString());
        boolean canEdit = request.get("canEdit") != null && (Boolean) request.get("canEdit");
        Integer expireDays = request.get("expireDays") != null ? Integer.valueOf(request.get("expireDays").toString()) : null;
        return Result.success(shareService.createShare(itineraryId, userId, canEdit, expireDays));
    }

    @GetMapping("/{shareCode}")
    public Result<Share> getShare(@PathVariable String shareCode) {
        Share share = shareService.getShareByCode(shareCode);
        if (share == null) {
            return Result.error("分享链接无效或已过期");
        }
        return Result.success(share);
    }

    @PostMapping("/join")
    public Result<Share> joinShare(@RequestBody Map<String, String> request) {
        String shareCode = request.get("shareCode");
        String nickname = request.get("nickname");
        try {
            Share share = shareService.joinShare(shareCode, nickname);
            return Result.success(share);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
