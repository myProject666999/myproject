package com.onsiterepair.utils;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Component
public class OrderNoUtils {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final Random RANDOM = new Random();

    public String generateOrderNo() {
        String time = LocalDateTime.now().format(FORMATTER);
        String random = String.format("%06d", RANDOM.nextInt(1000000));
        return time + random;
    }
}
