package com.birthdayreminder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.birthdayreminder.entity.GreetingCard;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GreetingCardMapper extends BaseMapper<GreetingCard> {
}
