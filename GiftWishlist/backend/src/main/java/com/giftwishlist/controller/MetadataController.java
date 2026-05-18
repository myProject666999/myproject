package com.giftwishlist.controller;

import com.giftwishlist.common.Result;
import com.giftwishlist.service.MetadataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/metadata")
@CrossOrigin
public class MetadataController {

    @Autowired
    private MetadataService metadataService;

    @GetMapping("/fetch")
    public Result<MetadataService.PageMetadata> fetchMetadata(@RequestParam String url) {
        return Result.success(metadataService.fetchMetadata(url));
    }
}
