package com.giftwishlist.service;

import lombok.Data;

public interface MetadataService {
    PageMetadata fetchMetadata(String url);

    @Data
    class PageMetadata {
        private String title;
        private String description;
        private String imageUrl;
    }
}
