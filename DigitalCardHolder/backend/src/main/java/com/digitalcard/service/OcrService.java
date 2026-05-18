package com.digitalcard.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baidu.aip.ocr.AipOcr;
import com.digitalcard.entity.Card;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;

@Service
public class OcrService {
    @Value("${baidu.ocr.app-id}")
    private String appId;

    @Value("${baidu.ocr.api-key}")
    private String apiKey;

    @Value("${baidu.ocr.secret-key}")
    private String secretKey;

    public Card recognize(MultipartFile file) throws Exception {
        AipOcr client = new AipOcr(appId, apiKey, secretKey);
        client.setConnectionTimeoutInMillis(2000);
        client.setSocketTimeoutInMillis(60000);

        byte[] imageBytes = file.getBytes();
        org.json.JSONObject res = client.businessCard(imageBytes, new HashMap<>());

        Card card = new Card();

        if (res.has("words_result")) {
            org.json.JSONObject wordsResult = res.getJSONObject("words_result");

            card.setName(getFieldValue(wordsResult, "NAME"));
            card.setTitle(getFieldValue(wordsResult, "POSITION"));
            card.setCompany(getFieldValue(wordsResult, "COMPANY"));
            card.setDepartment(getFieldValue(wordsResult, "DEPARTMENT"));
            card.setMobile(getFieldValue(wordsResult, "MOBILE"));
            card.setPhone(getFieldValue(wordsResult, "TEL"));
            card.setEmail(getFieldValue(wordsResult, "EMAIL"));
            card.setWebsite(getFieldValue(wordsResult, "URL"));
            card.setAddress(getFieldValue(wordsResult, "ADDR"));
            card.setFax(getFieldValue(wordsResult, "FAX"));
        }

        return card;
    }

    private String getFieldValue(org.json.JSONObject wordsResult, String fieldName) {
        if (wordsResult.has(fieldName)) {
            org.json.JSONObject field = wordsResult.getJSONObject(fieldName);
            return field.getString("words");
        }
        return null;
    }
}
