package com.birthdayreminder.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.birthdayreminder.entity.GreetingCard;

import java.util.List;

public interface GreetingCardService extends IService<GreetingCard> {
    List<GreetingCard> listByCategory(String category);
}
