package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.Admin;
import com.training.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public Result<Admin> login(String username, String password) {
        Optional<Admin> optional = adminRepository.findByUsername(username);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.LOGIN_FAILED);
        }
        Admin admin = optional.get();
        if (admin.getStatus() != null && admin.getStatus() == 0) {
            return Result.fail(ResultCode.USER_DISABLED);
        }
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            return Result.fail(ResultCode.LOGIN_FAILED);
        }
        admin.setPassword(null);
        return Result.success(admin);
    }

    public Result<Admin> add(Admin admin) {
        if (adminRepository.existsByUsername(admin.getUsername())) {
            return Result.fail("用户名已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        if (admin.getStatus() == null) {
            admin.setStatus(1);
        }
        if (admin.getPassword() != null && !admin.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        admin.setCreatedAt(now);
        admin.setUpdatedAt(now);
        Admin saved = adminRepository.save(admin);
        saved.setPassword(null);
        return Result.success(saved);
    }

    public Result<String> delete(Long id) {
        if (!adminRepository.existsById(id)) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        adminRepository.deleteById(id);
        return Result.success("删除成功");
    }

    public Result<Admin> update(Admin admin) {
        if (admin.getId() == null || !adminRepository.existsById(admin.getId())) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        Admin db = adminRepository.findById(admin.getId()).get();
        if (admin.getUsername() != null && !admin.getUsername().equals(db.getUsername())
                && adminRepository.existsByUsername(admin.getUsername())) {
            return Result.fail("用户名已存在");
        }
        if (admin.getName() != null) {
            db.setName(admin.getName());
        }
        if (admin.getPassword() != null && !admin.getPassword().isEmpty()) {
            db.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        if (admin.getEmail() != null) {
            db.setEmail(admin.getEmail());
        }
        if (admin.getPhone() != null) {
            db.setPhone(admin.getPhone());
        }
        if (admin.getStatus() != null) {
            db.setStatus(admin.getStatus());
        }
        db.setUpdatedAt(LocalDateTime.now());
        Admin saved = adminRepository.save(db);
        saved.setPassword(null);
        return Result.success(saved);
    }

    public Result<Admin> getById(Long id) {
        Optional<Admin> optional = adminRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        Admin admin = optional.get();
        admin.setPassword(null);
        return Result.success(admin);
    }

    public Result<List<Admin>> list(String name, Integer status) {
        List<Admin> list;
        if (name != null && !name.isEmpty() && status != null) {
            list = adminRepository.findByNameContainingAndStatus(name, status);
        } else if (name != null && !name.isEmpty()) {
            list = adminRepository.findByNameContaining(name);
        } else if (status != null) {
            list = adminRepository.findByStatus(status);
        } else {
            list = adminRepository.findAll();
        }
        list.forEach(a -> a.setPassword(null));
        return Result.success(list);
    }
}
