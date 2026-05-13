package com.court.reservation.controller;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.court.reservation.common.Result;
import com.court.reservation.entity.Card;
import com.court.reservation.mapper.CardMapper;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/card")
public class CardController {

    @Resource
    private CardMapper cardMapper;

    @GetMapping("/list")
    public Result<List<Card>> list(@RequestParam Long userId) {
        QueryWrapper<Card> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("create_time");
        return Result.success(cardMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Card> getById(@PathVariable Long id) {
        return Result.success(cardMapper.selectById(id));
    }

    @PostMapping
    public Result<Card> create(@RequestBody Card card) {
        card.setCardNo(IdUtil.simpleUUID().substring(0, 16).toUpperCase());
        card.setStatus(1);
        card.setCreateTime(LocalDateTime.now());
        card.setUpdateTime(LocalDateTime.now());

        if ("MONTHLY".equals(card.getCardType())) {
            if (card.getRemainingTimes() == null) {
                card.setRemainingTimes(30);
            }
            if (card.getExpireDate() == null) {
                card.setExpireDate(LocalDate.now().plusMonths(1));
            }
        } else if ("STORED".equals(card.getCardType())) {
            if (card.getBalance() == null) {
                card.setBalance(0.0);
            }
        }

        cardMapper.insert(card);
        return Result.success(card);
    }

    @PutMapping("/{id}")
    public Result<Card> update(@PathVariable Long id, @RequestBody Card card) {
        card.setId(id);
        card.setUpdateTime(LocalDateTime.now());
        cardMapper.updateById(card);
        return Result.success(card);
    }

    @PostMapping("/{id}/recharge")
    public Result<Card> recharge(@PathVariable Long id, @RequestBody Card rechargeData) {
        Card card = cardMapper.selectById(id);
        if (card == null) {
            throw new RuntimeException("会员卡不存在");
        }

        if ("STORED".equals(card.getCardType())) {
            card.setBalance(card.getBalance() + (rechargeData.getBalance() != null ? rechargeData.getBalance() : 0));
        } else if ("MONTHLY".equals(card.getCardType())) {
            if (rechargeData.getRemainingTimes() != null) {
                card.setRemainingTimes(card.getRemainingTimes() + rechargeData.getRemainingTimes());
            }
            if (card.getExpireDate() != null && card.getExpireDate().isBefore(LocalDate.now())) {
                card.setExpireDate(LocalDate.now().plusMonths(1));
            } else {
                card.setExpireDate(card.getExpireDate() != null ? card.getExpireDate().plusMonths(1) : LocalDate.now().plusMonths(1));
            }
        }
        card.setUpdateTime(LocalDateTime.now());
        cardMapper.updateById(card);
        return Result.success(card);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        cardMapper.deleteById(id);
        return Result.success();
    }
}