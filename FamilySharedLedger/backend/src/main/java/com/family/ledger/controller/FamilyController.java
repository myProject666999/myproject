package com.family.ledger.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.family.ledger.common.Result;
import com.family.ledger.entity.*;
import com.family.ledger.mapper.*;
import com.family.ledger.util.UserContext;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/family")
public class FamilyController {

    @Autowired
    private FamilyGroupMapper familyGroupMapper;

    @Autowired
    private FamilyMemberMapper familyMemberMapper;

    @Autowired
    private FamilyInviteMapper familyInviteMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserBalanceMapper userBalanceMapper;

    @GetMapping("/my")
    public Result<List<Map<String, Object>>> getMyFamilies() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        List<FamilyGroup> families = familyGroupMapper.selectByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (FamilyGroup family : families) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", family.getId());
            item.put("name", family.getName());
            item.put("description", family.getDescription());
            item.put("ownerId", family.getOwnerId());
            item.put("createTime", family.getCreateTime());

            List<FamilyMember> members = familyMemberMapper.selectByFamilyId(family.getId());
            List<Map<String, Object>> memberList = new ArrayList<>();
            for (FamilyMember member : members) {
                User user = userMapper.selectById(member.getUserId());
                if (user != null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", member.getId());
                    m.put("userId", member.getUserId());
                    m.put("nickname", user.getNickname());
                    m.put("role", member.getRole());
                    m.put("joinTime", member.getJoinTime());
                    memberList.add(m);
                }
            }
            item.put("members", memberList);
            result.add(item);
        }

        return Result.success(result);
    }

    @PostMapping
    public Result<FamilyGroup> createFamily(@RequestBody CreateFamilyRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        FamilyGroup family = new FamilyGroup();
        family.setName(request.getName());
        family.setDescription(request.getDescription());
        family.setOwnerId(userId);
        family.setStatus(1);
        family.setCreateTime(LocalDateTime.now());
        family.setUpdateTime(LocalDateTime.now());
        familyGroupMapper.insert(family);

        FamilyMember member = new FamilyMember();
        member.setFamilyId(family.getId());
        member.setUserId(userId);
        member.setRole(1);
        member.setJoinTime(LocalDateTime.now());
        member.setStatus(1);
        familyMemberMapper.insert(member);

        UserBalance balance = new UserBalance();
        balance.setFamilyId(family.getId());
        balance.setUserId(userId);
        balance.setTotalPaid(new java.math.BigDecimal(0));
        balance.setTotalShare(new java.math.BigDecimal(0));
        balance.setBalance(new java.math.BigDecimal(0));
        balance.setUpdateTime(LocalDateTime.now());
        userBalanceMapper.insert(balance);

        return Result.success(family);
    }

    @PostMapping("/invite")
    public Result<FamilyInvite> inviteMember(@RequestBody InviteRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        FamilyMember member = familyMemberMapper.selectOne(
                new QueryWrapper<FamilyMember>()
                        .eq("family_id", request.getFamilyId())
                        .eq("user_id", userId)
                        .eq("status", 1)
        );

        if (member == null || member.getRole() != 1) {
            return Result.error("只有管理员可以邀请成员");
        }

        User invitee = userMapper.selectOne(
                new QueryWrapper<User>().eq("email", request.getEmail())
        );

        FamilyInvite invite = new FamilyInvite();
        invite.setFamilyId(request.getFamilyId());
        invite.setInviterId(userId);
        invite.setInviteeEmail(request.getEmail());
        invite.setInviteeName(request.getName());
        invite.setStatus(0);
        invite.setExpireTime(LocalDateTime.now().plusDays(7));
        invite.setCreateTime(LocalDateTime.now());
        familyInviteMapper.insert(invite);

        return Result.success(invite);
    }

    @GetMapping("/{familyId}/members")
    public Result<List<Map<String, Object>>> getMembers(@PathVariable Long familyId) {
        List<FamilyMember> members = familyMemberMapper.selectByFamilyId(familyId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (FamilyMember member : members) {
            User user = userMapper.selectById(member.getUserId());
            if (user != null) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", member.getId());
                m.put("userId", member.getUserId());
                m.put("nickname", user.getNickname());
                m.put("role", member.getRole());
                m.put("joinTime", member.getJoinTime());
                result.add(m);
            }
        }

        return Result.success(result);
    }

    @Data
    public static class CreateFamilyRequest {
        private String name;
        private String description;
    }

    @Data
    public static class InviteRequest {
        private Long familyId;
        private String email;
        private String name;
    }
}
