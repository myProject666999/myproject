package com.medication.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.medication.entity.User;
import java.util.List;

public interface UserService extends IService<User> {
    List<User> listAll();
    User getById(Long id);
}
