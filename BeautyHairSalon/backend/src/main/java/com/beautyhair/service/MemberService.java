
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.Member;
import com.beautyhair.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberMapper memberMapper;

    public PageResult<Member> getMemberPage(int page, int size, String keyword, String level, Integer status) {
        Page<Member> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Member> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Member::getMemberName, keyword)
                    .or().like(Member::getPhone, keyword)
                    .or().like(Member::getMemberNo, keyword));
        }
        if (StrUtil.isNotBlank(level)) {
            wrapper.eq(Member::getLevel, level);
        }
        if (status != null) {
            wrapper.eq(Member::getStatus, status);
        }
        wrapper.orderByDesc(Member::getCreateTime);

        IPage<Member> result = memberMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public Member getById(Long id) {
        return memberMapper.selectById(id);
    }

    public Member getByPhone(String phone) {
        return memberMapper.selectOne(
                new LambdaQueryWrapper<Member>().eq(Member::getPhone, phone)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Member member) {
        if (StrUtil.isBlank(member.getMemberNo())) {
            member.setMemberNo("M" + System.currentTimeMillis());
        }
        if (member.getRegisterDate() == null) {
            member.setRegisterDate(LocalDate.now());
        }
        if (member.getPoints() == null) {
            member.setPoints(0);
        }
        if (member.getBalance() == null) {
            member.setBalance(java.math.BigDecimal.ZERO);
        }
        if (member.getStatus() == null) {
            member.setStatus(1);
        }
        memberMapper.insert(member);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Member member) {
        memberMapper.updateById(member);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        memberMapper.deleteById(id);
    }

    public Map<String, Object> getMemberStatistics() {
        Map<String, Object> stats = new HashMap<>();

        Long total = memberMapper.selectCount(new LambdaQueryWrapper<>());
        Long todayBirthdays = memberMapper.countTodayBirthdays();
        Long newMembers = memberMapper.countNewMembersLast30Days();

        stats.put("total", total);
        stats.put("todayBirthdays", todayBirthdays);
        stats.put("newMembersLast30Days", newMembers);

        return stats;
    }
}
