package com.workorder.service;

import com.workorder.entity.User;
import java.util.List;

public interface UserService {

    User getUserById(Long id);

    User getUserByUsername(String username);

    List<User> getAgents();

    List<User> getCustomers();

    List<User> getAllUsers();
}