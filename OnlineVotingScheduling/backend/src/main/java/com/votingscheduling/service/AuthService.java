package com.votingscheduling.service;

import com.votingscheduling.dto.LoginRequest;
import com.votingscheduling.dto.LoginResponse;
import com.votingscheduling.dto.RegisterRequest;
import com.votingscheduling.entity.User;
import com.votingscheduling.common.UserRole;
import com.votingscheduling.repository.UserRepository;
import com.votingscheduling.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .realName(request.getRealName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(UserRole.MEMBER)
                .status("ACTIVE")
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .role(user.getRole().name())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Account is disabled");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .role(user.getRole().name())
                .build();
    }
}