package com.birthdayreminder.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.birthdayreminder.entity.GreetingCard;
import com.birthdayreminder.mapper.GreetingCardMapper;
import com.birthdayreminder.service.GreetingCardService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GreetingCardServiceImpl extends ServiceImpl<GreetingCardMapper, GreetingCard> implements GreetingCardService {

    @Override
    public List<GreetingCard> listByCategory(String category) {
        LambdaQueryWrapper<GreetingCard> wrapper = new LambdaQueryWrapper<>();
        if (category != null && !category.isEmpty()) {
            wrapper.eq(GreetingCard::getCategory, category);
        }
        return list(wrapper);
    }
}
