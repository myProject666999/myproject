package com.gym.membership.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.common.PageResult;
import com.gym.membership.entity.MembershipCard;
import com.gym.membership.entity.RenewalReminder;
import com.gym.membership.mapper.RenewalReminderMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RenewalReminderService extends ServiceImpl<RenewalReminderMapper, RenewalReminder> {

    private final MembershipCardService membershipCardService;

    public RenewalReminderService(MembershipCardService membershipCardService) {
        this.membershipCardService = membershipCardService;
    }

    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void generateReminders() {
        membershipCardService.updateCardStatusDaily();

        LocalDate today = LocalDate.now();
        LocalDate expireDate7 = today.plusDays(7);
        LocalDate expireDate3 = today.plusDays(3);

        List<MembershipCard> cards = membershipCardService.list(new LambdaQueryWrapper<MembershipCard>()
                .eq(MembershipCard::getStatus, 1)
                .and(w -> w
                        .le(MembershipCard::getEndDate, expireDate7)
                        .ge(MembershipCard::getEndDate, today)
                        .or()
                        .apply("remaining_times <= 5")));

        for (MembershipCard card : cards) {
            String reminderType;
            if (card.getEndDate() != null && (card.getEndDate().isEqual(expireDate7) || card.getEndDate().isEqual(expireDate3))) {
                reminderType = "即将过期";
            } else if (card.getRemainingTimes() != null && card.getRemainingTimes() <= 5) {
                reminderType = "次数不足";
            } else {
                continue;
            }

            RenewalReminder exist = this.getOne(new LambdaQueryWrapper<RenewalReminder>()
                    .eq(RenewalReminder::getCardId, card.getId())
                    .eq(RenewalReminder::getReminderType, reminderType)
                    .eq(RenewalReminder::getReminderDate, today));

            if (exist == null) {
                RenewalReminder reminder = new RenewalReminder();
                reminder.setCardId(card.getId());
                reminder.setUserId(card.getUserId());
                reminder.setReminderType(reminderType);
                reminder.setReminderDate(today);
                reminder.setStatus(0);
                this.save(reminder);
            }
        }
    }

    public PageResult<RenewalReminder> getReminderPage(Long pageNum, Long pageSize,
                                                       Long userId, Integer status,
                                                       LocalDate startDate, LocalDate endDate) {
        Page<RenewalReminder> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<RenewalReminder> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(RenewalReminder::getUserId, userId);
        }
        if (status != null) {
            wrapper.eq(RenewalReminder::getStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(RenewalReminder::getReminderDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(RenewalReminder::getReminderDate, endDate);
        }
        wrapper.orderByDesc(RenewalReminder::getReminderDate);

        IPage<RenewalReminder> reminderPage = this.page(page, wrapper);

        PageResult<RenewalReminder> result = new PageResult<>();
        result.setTotal(reminderPage.getTotal());
        result.setPages(reminderPage.getPages());
        result.setCurrent(reminderPage.getCurrent());
        result.setSize(reminderPage.getSize());
        result.setRecords(reminderPage.getRecords());

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void markAsSent(Long id) {
        RenewalReminder reminder = this.getById(id);
        if (reminder != null) {
            reminder.setStatus(1);
            this.updateById(reminder);
        }
    }
}
