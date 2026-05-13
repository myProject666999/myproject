package com.gym.membership.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.common.PageResult;
import com.gym.membership.dto.MembershipCardPurchaseDTO;
import com.gym.membership.entity.*;
import com.gym.membership.exception.BusinessException;
import com.gym.membership.mapper.*;
import com.gym.membership.vo.MembershipCardVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MembershipCardService extends ServiceImpl<MembershipCardMapper, MembershipCard> {

    private final MembershipCardTypeMapper cardTypeMapper;
    private final MembershipCardOrderMapper orderMapper;
    private final UserMapper userMapper;

    public MembershipCardService(MembershipCardTypeMapper cardTypeMapper,
                                 MembershipCardOrderMapper orderMapper,
                                 UserMapper userMapper) {
        this.cardTypeMapper = cardTypeMapper;
        this.orderMapper = orderMapper;
        this.userMapper = userMapper;
    }

    public List<MembershipCardType> getCardTypeList() {
        return cardTypeMapper.selectList(new LambdaQueryWrapper<MembershipCardType>()
                .eq(MembershipCardType::getStatus, 1)
                .orderByAsc(MembershipCardType::getPrice));
    }

    @Transactional(rollbackFor = Exception.class)
    public MembershipCardVO purchaseCard(MembershipCardPurchaseDTO dto) {
        MembershipCardType cardType = cardTypeMapper.selectById(dto.getCardTypeId());
        if (cardType == null || cardType.getStatus() != 1) {
            throw new BusinessException("卡类型不存在或已下架");
        }

        User user = userMapper.selectById(dto.getUserId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        MembershipCard card = new MembershipCard();
        card.setCardNo(generateCardNo());
        card.setUserId(dto.getUserId());
        card.setCardTypeId(dto.getCardTypeId());
        card.setStatus(1);

        if (cardType.getDurationDays() != null) {
            card.setStartDate(LocalDate.now());
            card.setEndDate(LocalDate.now().plusDays(cardType.getDurationDays()));
        }

        if (cardType.getTotalTimes() != null) {
            card.setRemainingTimes(cardType.getTotalTimes());
            card.setStartDate(LocalDate.now());
            card.setEndDate(LocalDate.now().plusDays(cardType.getTotalTimes() >= 50 ? 365 : 180));
        }

        this.save(card);

        MembershipCardOrder order = new MembershipCardOrder();
        order.setOrderNo("CD" + IdUtil.getSnowflakeNextIdStr());
        order.setUserId(dto.getUserId());
        order.setCardId(card.getId());
        order.setCardTypeId(dto.getCardTypeId());
        order.setAmount(dto.getAmount() != null ? dto.getAmount() : cardType.getPrice());
        order.setPayType(dto.getPayType());
        order.setStatus(1);
        orderMapper.insert(order);

        return convertToVO(card);
    }

    private String generateCardNo() {
        return "GK" + System.currentTimeMillis();
    }

    public PageResult<MembershipCardVO> getCardPage(Long pageNum, Long pageSize, Long userId, String keyword, Integer status) {
        Page<MembershipCard> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<MembershipCard> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(MembershipCard::getUserId, userId);
        }
        if (StringUtils.hasText(keyword)) {
            List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>()
                    .like(User::getRealName, keyword)
                    .or().like(User::getPhone, keyword));
            List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());
            if (!userIds.isEmpty()) {
                wrapper.in(MembershipCard::getUserId, userIds);
            }
        }
        if (status != null) {
            wrapper.eq(MembershipCard::getStatus, status);
        }
        wrapper.orderByDesc(MembershipCard::getCreateTime);

        IPage<MembershipCard> cardPage = this.page(page, wrapper);

        PageResult<MembershipCardVO> result = new PageResult<>();
        result.setTotal(cardPage.getTotal());
        result.setPages(cardPage.getPages());
        result.setCurrent(cardPage.getCurrent());
        result.setSize(cardPage.getSize());
        result.setRecords(cardPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));

        return result;
    }

    private MembershipCardVO convertToVO(MembershipCard card) {
        MembershipCardVO vo = new MembershipCardVO();
        vo.setId(card.getId());
        vo.setCardNo(card.getCardNo());
        vo.setUserId(card.getUserId());
        vo.setCardTypeId(card.getCardTypeId());
        vo.setStatus(card.getStatus());
        vo.setStartDate(card.getStartDate());
        vo.setEndDate(card.getEndDate());
        vo.setRemainingTimes(card.getRemainingTimes());

        if (card.getStatus() == null) {
            vo.setStatusName("未知");
        } else {
            switch (card.getStatus()) {
                case 1: vo.setStatusName("正常"); break;
                case 2: vo.setStatusName("已过期"); break;
                case 3: vo.setStatusName("已冻结"); break;
                default: vo.setStatusName("未知");
            }
        }

        User user = userMapper.selectById(card.getUserId());
        if (user != null) {
            vo.setUserName(user.getRealName());
        }

        MembershipCardType cardType = cardTypeMapper.selectById(card.getCardTypeId());
        if (cardType != null) {
            vo.setCardTypeName(cardType.getTypeName());
            vo.setCardTypeCode(cardType.getTypeCode());
            vo.setDurationDays(cardType.getDurationDays());
            vo.setTotalTimes(cardType.getTotalTimes());
            vo.setPrice(cardType.getPrice());
        }

        return vo;
    }

    public MembershipCardVO getCardById(Long id) {
        MembershipCard card = this.getById(id);
        if (card == null) {
            throw new BusinessException("会员卡不存在");
        }
        return convertToVO(card);
    }

    public List<MembershipCardVO> getCardsByUserId(Long userId) {
        List<MembershipCard> cards = this.list(new LambdaQueryWrapper<MembershipCard>()
                .eq(MembershipCard::getUserId, userId)
                .orderByDesc(MembershipCard::getCreateTime));
        return cards.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public void renewCard(Long cardId, Long cardTypeId, BigDecimal amount) {
        MembershipCard card = this.getById(cardId);
        if (card == null) {
            throw new BusinessException("会员卡不存在");
        }

        MembershipCardType cardType = cardTypeMapper.selectById(cardTypeId);
        if (cardType == null) {
            throw new BusinessException("卡类型不存在");
        }

        if (card.getStatus() == 2) {
            card.setStartDate(LocalDate.now());
        }

        if (cardType.getDurationDays() != null) {
            if (card.getEndDate() != null && card.getEndDate().isAfter(LocalDate.now())) {
                card.setEndDate(card.getEndDate().plusDays(cardType.getDurationDays()));
            } else {
                card.setStartDate(LocalDate.now());
                card.setEndDate(LocalDate.now().plusDays(cardType.getDurationDays()));
            }
        }

        if (cardType.getTotalTimes() != null) {
            card.setRemainingTimes((card.getRemainingTimes() == null ? 0 : card.getRemainingTimes()) + cardType.getTotalTimes());
            if (card.getEndDate() == null || card.getEndDate().isBefore(LocalDate.now())) {
                card.setStartDate(LocalDate.now());
                card.setEndDate(LocalDate.now().plusDays(cardType.getTotalTimes() >= 50 ? 365 : 180));
            }
        }

        card.setStatus(1);
        this.updateById(card);

        MembershipCardOrder order = new MembershipCardOrder();
        order.setOrderNo("XF" + IdUtil.getSnowflakeNextIdStr());
        order.setUserId(card.getUserId());
        order.setCardId(cardId);
        order.setCardTypeId(cardTypeId);
        order.setAmount(amount != null ? amount : cardType.getPrice());
        order.setStatus(1);
        orderMapper.insert(order);
    }

    public void updateStatus(Long id, Integer status) {
        MembershipCard card = this.getById(id);
        if (card == null) {
            throw new BusinessException("会员卡不存在");
        }
        card.setStatus(status);
        this.updateById(card);
    }

    public void updateCardStatusDaily() {
        LocalDate today = LocalDate.now();
        List<MembershipCard> cards = this.list(new LambdaQueryWrapper<MembershipCard>()
                .eq(MembershipCard::getStatus, 1)
                .lt(MembershipCard::getEndDate, today));

        for (MembershipCard card : cards) {
            card.setStatus(2);
        }

        if (!cards.isEmpty()) {
            this.updateBatchById(cards);
        }
    }

    public boolean checkAndConsumeTimes(Long userId) {
        List<MembershipCard> cards = this.list(new LambdaQueryWrapper<MembershipCard>()
                .eq(MembershipCard::getUserId, userId)
                .eq(MembershipCard::getStatus, 1)
                .ge(MembershipCard::getEndDate, LocalDate.now())
                .orderByAsc(MembershipCard::getCreateTime));

        if (cards.isEmpty()) {
            return false;
        }

        for (MembershipCard card : cards) {
            if (card.getRemainingTimes() == null || card.getRemainingTimes() > 0) {
                if (card.getRemainingTimes() != null) {
                    card.setRemainingTimes(card.getRemainingTimes() - 1);
                    this.updateById(card);
                }
                return true;
            }
        }

        return false;
    }
}
