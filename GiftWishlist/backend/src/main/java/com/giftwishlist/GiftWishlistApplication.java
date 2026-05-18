package com.giftwishlist;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.giftwishlist.mapper")
public class GiftWishlistApplication {

    public static void main(String[] args) {
        SpringApplication.run(GiftWishlistApplication.class, args);
    }
}
