package com.digitalcard.controller;

import com.digitalcard.common.Result;
import com.digitalcard.entity.Card;
import com.digitalcard.service.CardService;
import com.digitalcard.service.OcrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/ocr")
public class OcrController {
    @Autowired
    private OcrService ocrService;

    @Autowired
    private CardService cardService;

    private final Long DEFAULT_USER_ID = 1L;

    @PostMapping("/recognize")
    public Result<Card> recognize(@RequestParam("file") MultipartFile file) throws Exception {
        Card card = ocrService.recognize(file);
        card.setUserId(DEFAULT_USER_ID);
        return Result.success(card);
    }

    @PostMapping("/recognize-and-save")
    public Result<Card> recognizeAndSave(@RequestParam("file") MultipartFile file) throws Exception {
        Card card = ocrService.recognize(file);
        card.setUserId(DEFAULT_USER_ID);
        card.setIsFavorite(false);
        cardService.save(card);
        return Result.success(card);
    }
}
