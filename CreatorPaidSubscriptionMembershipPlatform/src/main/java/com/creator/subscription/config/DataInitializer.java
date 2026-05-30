package com.creator.subscription.config;

import com.creator.subscription.entity.User;
import com.creator.subscription.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String correctHash = passwordEncoder.encode("password");
        log.info("Correct password hash for 'password': {}", correctHash);

        userRepository.findAll().forEach(user -> {
            if (!passwordEncoder.matches("password", user.getPasswordHash())) {
                log.info("Updating password hash for user: {}", user.getEmail());
                user.setPasswordHash(correctHash);
                userRepository.save(user);
            }
        });

        log.info("Password hash initialization completed");
    }
}
