package com.digitalcard.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitalcard.entity.Card;
import com.digitalcard.mapper.CardMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CardService {
    @Autowired
    private CardMapper cardMapper;

    public IPage<Card> list(Long userId, Long groupId, String keyword, Integer pageNum, Integer pageSize) {
        Page<Card> page = new Page<>(pageNum, pageSize);
        QueryWrapper<Card> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        if (groupId != null) {
            wrapper.eq("group_id", groupId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like("name", keyword)
                    .or().like("company", keyword)
                    .or().like("mobile", keyword)
                    .or().like("email", keyword)
                    .or().like("title", keyword));
        }
        wrapper.orderByDesc("is_favorite", "created_at");
        return cardMapper.selectPage(page, wrapper);
    }

    public List<Card> listAll(Long userId) {
        QueryWrapper<Card> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("created_at");
        return cardMapper.selectList(wrapper);
    }

    public Card getById(Long id, Long userId) {
        QueryWrapper<Card> wrapper = new QueryWrapper<>();
        wrapper.eq("id", id).eq("user_id", userId);
        return cardMapper.selectOne(wrapper);
    }

    public void save(Card card) {
        cardMapper.insert(card);
    }

    public void update(Card card) {
        cardMapper.updateById(card);
    }

    public void delete(Long id, Long userId) {
        QueryWrapper<Card> wrapper = new QueryWrapper<>();
        wrapper.eq("id", id).eq("user_id", userId);
        cardMapper.delete(wrapper);
    }

    public void toggleFavorite(Long id, Long userId) {
        Card card = getById(id, userId);
        if (card != null) {
            card.setIsFavorite(!card.getIsFavorite());
            cardMapper.updateById(card);
        }
    }
}
