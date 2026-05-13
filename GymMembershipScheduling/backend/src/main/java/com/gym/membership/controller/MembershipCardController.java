package com.gym.membership.controller;

import com.gym.membership.common.PageResult;
import com.gym.membership.common.Result;
import com.gym.membership.dto.MembershipCardPurchaseDTO;
import com.gym.membership.entity.MembershipCardType;
import com.gym.membership.service.MembershipCardService;
import com.gym.membership.vo.MembershipCardVO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/membership-cards")
public class MembershipCardController {

    private final MembershipCardService cardService;

    public MembershipCardController(MembershipCardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/types")
    public Result<List<MembershipCardType>> getCardTypeList() {
        List<MembershipCardType> types = cardService.getCardTypeList();
        return Result.success(types);
    }

    @PostMapping("/purchase")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<MembershipCardVO> purchaseCard(@RequestBody MembershipCardPurchaseDTO dto) {
        MembershipCardVO vo = cardService.purchaseCard(dto);
        return Result.success("购卡成功", vo);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<PageResult<MembershipCardVO>> getCardPage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        PageResult<MembershipCardVO> result = cardService.getCardPage(pageNum, pageSize, userId, keyword, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<MembershipCardVO> getCardById(@PathVariable Long id) {
        MembershipCardVO vo = cardService.getCardById(id);
        return Result.success(vo);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<List<MembershipCardVO>> getCardsByUserId(@PathVariable Long userId) {
        List<MembershipCardVO> cards = cardService.getCardsByUserId(userId);
        return Result.success(cards);
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<Void> renewCard(@PathVariable Long id,
                                  @RequestParam Long cardTypeId,
                                  @RequestParam(required = false) BigDecimal amount) {
        cardService.renewCard(id, cardTypeId, amount);
        return Result.success("续卡成功", null);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        cardService.updateStatus(id, status);
        return Result.success("状态更新成功", null);
    }
}
