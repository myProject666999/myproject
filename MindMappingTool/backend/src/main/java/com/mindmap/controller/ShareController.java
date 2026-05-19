package com.mindmap.controller;

import com.mindmap.common.Result;
import com.mindmap.entity.MindMap;
import com.mindmap.entity.Share;
import com.mindmap.service.MindMapService;
import com.mindmap.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/share")
@CrossOrigin(origins = "*")
public class ShareController {

    @Autowired
    private ShareService shareService;

    @Autowired
    private MindMapService mindMapService;

    @PostMapping("/create")
    public Result<Share> create(@RequestParam Long mindmapId) {
        return Result.success(shareService.createShare(mindmapId));
    }

    @GetMapping("/{shareCode}")
    public Result<MindMap> getByShareCode(@PathVariable String shareCode) {
        Share share = shareService.getByShareCode(shareCode);
        if (share == null) {
            return Result.error("分享链接不存在或已过期");
        }
        shareService.incrementViewCount(share.getId());
        MindMap mindMap = mindMapService.getDetail(share.getMindmapId());
        return Result.success(mindMap);
    }
}
