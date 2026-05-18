package com.digitalcard.controller;

import com.digitalcard.common.Result;
import com.digitalcard.entity.Card;
import com.digitalcard.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/vcard")
public class VCardController {
    @Autowired
    private CardService cardService;

    private final Long DEFAULT_USER_ID = 1L;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> exportVCard(@PathVariable Long id) {
        Card card = cardService.getById(id, DEFAULT_USER_ID);
        if (card == null) {
            return ResponseEntity.notFound().build();
        }

        String vcard = generateVCard(card);
        byte[] bytes = vcard.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard;charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", card.getName() + ".vcf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    @GetMapping("/export-all")
    public ResponseEntity<byte[]> exportAllVCards() {
        List<Card> cards = cardService.listAll(DEFAULT_USER_ID);
        StringBuilder sb = new StringBuilder();
        for (Card card : cards) {
            sb.append(generateVCard(card));
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard;charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "all-contacts.vcf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    private String generateVCard(Card card) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCARD\n");
        sb.append("VERSION:3.0\n");
        sb.append("FN:").append(card.getName()).append("\n");
        sb.append("N:").append(card.getName()).append(";;;\n");
        if (card.getTitle() != null) {
            sb.append("TITLE:").append(card.getTitle()).append("\n");
        }
        if (card.getCompany() != null) {
            sb.append("ORG:").append(card.getCompany());
            if (card.getDepartment() != null) {
                sb.append(";").append(card.getDepartment());
            }
            sb.append("\n");
        }
        if (card.getMobile() != null) {
            sb.append("TEL;TYPE=CELL:").append(card.getMobile()).append("\n");
        }
        if (card.getPhone() != null) {
            sb.append("TEL;TYPE=WORK:").append(card.getPhone()).append("\n");
        }
        if (card.getEmail() != null) {
            sb.append("EMAIL:").append(card.getEmail()).append("\n");
        }
        if (card.getWebsite() != null) {
            sb.append("URL:").append(card.getWebsite()).append("\n");
        }
        if (card.getAddress() != null) {
            sb.append("ADR;TYPE=WORK:;;").append(card.getAddress()).append(";;;;\n");
        }
        if (card.getWechat() != null) {
            sb.append("X-WECHAT:").append(card.getWechat()).append("\n");
        }
        if (card.getRemark() != null) {
            sb.append("NOTE:").append(card.getRemark()).append("\n");
        }
        sb.append("END:VCARD\n");
        return sb.toString();
    }
}
