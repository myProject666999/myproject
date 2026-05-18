package com.giftwishlist.service.impl;

import com.giftwishlist.service.MetadataService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import java.io.IOException;

@Service
public class MetadataServiceImpl implements MetadataService {

    @Override
    public PageMetadata fetchMetadata(String url) {
        PageMetadata metadata = new PageMetadata();
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(10000)
                    .get();

            Element ogTitle = doc.selectFirst("meta[property=og:title]");
            if (ogTitle != null) {
                metadata.setTitle(ogTitle.attr("content"));
            } else {
                metadata.setTitle(doc.title());
            }

            Element ogDescription = doc.selectFirst("meta[property=og:description]");
            if (ogDescription != null) {
                metadata.setDescription(ogDescription.attr("content"));
            } else {
                Element metaDesc = doc.selectFirst("meta[name=description]");
                if (metaDesc != null) {
                    metadata.setDescription(metaDesc.attr("content"));
                }
            }

            Element ogImage = doc.selectFirst("meta[property=og:image]");
            if (ogImage != null) {
                String imageUrl = ogImage.attr("content");
                if (!imageUrl.startsWith("http")) {
                    imageUrl = url + imageUrl;
                }
                metadata.setImageUrl(imageUrl);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return metadata;
    }
}
