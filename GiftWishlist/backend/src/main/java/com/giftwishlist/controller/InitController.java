package com.giftwishlist.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.giftwishlist.common.Result;
import com.giftwishlist.entity.*;
import com.giftwishlist.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/init")
@CrossOrigin
public class InitController {

    @Autowired
    private UserService userService;
    @Autowired
    private WishlistService wishlistService;
    @Autowired
    private ItemService itemService;
    @Autowired
    private FriendshipService friendshipService;
    @Autowired
    private ClaimRecordService claimRecordService;

    @PostMapping("/reset")
    public Result<String> resetData() {
        try {
            claimRecordService.remove(new QueryWrapper<>());
            itemService.remove(new QueryWrapper<>());
            wishlistService.remove(new QueryWrapper<>());
            friendshipService.remove(new QueryWrapper<>());
            userService.remove(new QueryWrapper<>());

            User u1 = new User();
            u1.setUsername("alice");
            u1.setNickname("爱丽丝");
            u1.setBirthday(LocalDate.of(1995, 6, 15));
            u1.setPassword("123456");
            userService.save(u1);

            User u2 = new User();
            u2.setUsername("bob");
            u2.setNickname("鲍勃");
            u2.setBirthday(LocalDate.of(1994, 8, 20));
            u2.setPassword("123456");
            userService.save(u2);

            User u3 = new User();
            u3.setUsername("charlie");
            u3.setNickname("查理");
            u3.setBirthday(LocalDate.of(1996, 3, 10));
            u3.setPassword("123456");
            userService.save(u3);

            addFriendship(u1.getId(), u2.getId());
            addFriendship(u2.getId(), u1.getId());
            addFriendship(u1.getId(), u3.getId());
            addFriendship(u3.getId(), u1.getId());

            Wishlist w1 = new Wishlist();
            w1.setUserId(u1.getId());
            w1.setTitle("生日礼物");
            w1.setDescription("希望收到的生日礼物");
            w1.setIsPublic(1);
            wishlistService.save(w1);

            Wishlist w2 = new Wishlist();
            w2.setUserId(u1.getId());
            w2.setTitle("圣诞礼物");
            w2.setDescription("圣诞心愿清单");
            w2.setIsPublic(1);
            wishlistService.save(w2);

            Wishlist w3 = new Wishlist();
            w3.setUserId(u2.getId());
            w3.setTitle("生日愿望");
            w3.setDescription("今年的生日愿望");
            w3.setIsPublic(1);
            wishlistService.save(w3);

            Item i1 = new Item();
            i1.setWishlistId(w1.getId());
            i1.setTitle("AirPods Pro");
            i1.setDescription("降噪耳机");
            i1.setUrl("https://www.apple.com/airpods-pro/");
            i1.setPrice(new BigDecimal("1999.00"));
            i1.setPriority(2);
            i1.setIsClaimed(0);
            itemService.save(i1);

            Item i2 = new Item();
            i2.setWishlistId(w1.getId());
            i2.setTitle("机械键盘");
            i2.setDescription("Cherry轴机械键盘");
            i2.setUrl("https://www.cherrymx.de/");
            i2.setPrice(new BigDecimal("899.00"));
            i2.setPriority(1);
            i2.setIsClaimed(0);
            itemService.save(i2);

            Item i3 = new Item();
            i3.setWishlistId(w2.getId());
            i3.setTitle("旅行背包");
            i3.setDescription("大容量旅行背包");
            i3.setPrice(new BigDecimal("599.00"));
            i3.setPriority(2);
            i3.setIsClaimed(0);
            itemService.save(i3);

            Item i4 = new Item();
            i4.setWishlistId(w3.getId());
            i4.setTitle("游戏手柄");
            i4.setDescription("PS5游戏手柄");
            i4.setPrice(new BigDecimal("499.00"));
            i4.setPriority(1);
            i4.setIsClaimed(0);
            itemService.save(i4);

            return Result.success("数据重置成功！测试账号：alice/bob/charlie，密码都是123456");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("数据重置失败：" + e.getMessage());
        }
    }

    private void addFriendship(Long userId, Long friendId) {
        Friendship fs = new Friendship();
        fs.setUserId(userId);
        fs.setFriendId(friendId);
        fs.setStatus(1);
        friendshipService.save(fs);
    }
}
