package com.gym.membership;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "123456";
        
        for (int i = 0; i < 5; i++) {
            String encoded = encoder.encode(password);
            System.out.println("Password: " + password);
            System.out.println("Encoded: " + encoded);
            System.out.println("Matches: " + encoder.matches(password, encoded));
            System.out.println();
        }
    }
}
