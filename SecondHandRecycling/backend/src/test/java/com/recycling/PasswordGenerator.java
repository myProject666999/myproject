package com.recycling;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "123456";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Password: " + rawPassword);
        System.out.println("Encoded: " + encodedPassword);
        
        System.out.println("\nVerify: " + encoder.matches(rawPassword, encodedPassword));
    }
}
