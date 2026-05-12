package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.Herb;
import com.tcm.system.repository.HerbRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HerbService {

    @Autowired
    private HerbRepository herbRepository;

    public List<Herb> list(String keyword, String category) {
        LambdaQueryWrapper<Herb> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Herb::getName, keyword)
                    .or().like(Herb::getPinyin, keyword);
        }
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Herb::getCategory, category);
        }
        wrapper.orderByAsc(Herb::getName);
        return herbRepository.selectList(wrapper);
    }

    public Herb getById(Long id) {
        return herbRepository.selectById(id);
    }

    public Herb getByName(String name) {
        LambdaQueryWrapper<Herb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Herb::getName, name);
        return herbRepository.selectOne(wrapper);
    }

    public boolean save(Herb herb) {
        return herbRepository.insert(herb) > 0;
    }

    public boolean update(Herb herb) {
        return herbRepository.updateById(herb) > 0;
    }

    public boolean delete(Long id) {
        return herbRepository.deleteById(id) > 0;
    }
}
