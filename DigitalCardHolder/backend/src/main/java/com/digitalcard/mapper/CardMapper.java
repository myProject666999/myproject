package com.digitalcard.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.digitalcard.entity.Card;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CardMapper extends BaseMapper<Card> {
}
