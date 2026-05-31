package com.votingscheduling.service;

import com.votingscheduling.entity.User;
import com.votingscheduling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUser(Long id, User user) {
        User existing = findById(id);
        if (user.getRealName() != null) existing.setRealName(user.getRealName());
        if (user.getEmail() != null) existing.setEmail(user.getEmail());
        if (user.getPhone() != null) existing.setPhone(user.getPhone());
        if (user.getAvatar() != null) existing.setAvatar(user.getAvatar());
        return userRepository.save(existing);
    }

    @Transactional
    public void changeStatus(Long id, String status) {
        User user = findById(id);
        user.setStatus(status);
        userRepository.save(user);
    }
}
