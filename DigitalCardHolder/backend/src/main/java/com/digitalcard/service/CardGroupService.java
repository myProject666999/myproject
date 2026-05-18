package com.digitalcard.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.digitalcard.entity.CardGroup;
import com.digitalcard.mapper.CardGroupMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardGroupService {
    @Autowired
    private CardGroupMapper cardGroupMapper;

    public List<CardGroup> list(Long userId) {
        QueryWrapper<CardGroup> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByAsc("sort_order", "created_at");
        return cardGroupMapper.selectList(wrapper);
    }

    public CardGroup getById(Long id, Long userId) {
        QueryWrapper<CardGroup> wrapper = new QueryWrapper<>();
        wrapper.eq("id", id).eq("user_id", userId);
        return cardGroupMapper.selectOne(wrapper);
    }

    public void save(CardGroup group) {
        cardGroupMapper.insert(group);
    }

    public void update(CardGroup group) {
        cardGroupMapper.updateById(group);
    }

    public void delete(Long id, Long userId) {
        QueryWrapper<CardGroup> wrapper = new QueryWrapper<>();
        wrapper.eq("id", id).eq("user_id", userId);
        cardGroupMapper.delete(wrapper);
    }
}
