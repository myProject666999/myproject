package com.family.ledger;

import com.family.ledger.entity.Transfer;
import com.family.ledger.util.SettlementUtil;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SettlementUtilTest {

    public void testTwoUsers() {
        Map<Long, BigDecimal> balances = new HashMap<>();
        balances.put(1L, new BigDecimal("-1037.75"));
        balances.put(2L, new BigDecimal("1037.75"));

        List<Transfer> transfers = SettlementUtil.calculateMinTransfers(balances, 1L);

        System.out.println("两人结算测试:");
        for (Transfer t : transfers) {
            System.out.printf("用户%d 转给 用户%d: %.2f元%n", t.getFromUserId(), t.getToUserId(), t.getAmount());
        }
        assert transfers.size() == 1;
        assert transfers.get(0).getFromUserId().equals(1L);
        assert transfers.get(0).getToUserId().equals(2L);
    }

    public void testFourUsers() {
        Map<Long, BigDecimal> balances = new HashMap<>();
        balances.put(1L, new BigDecimal("285.00"));
        balances.put(2L, new BigDecimal("-15.00"));
        balances.put(3L, new BigDecimal("-135.00"));
        balances.put(4L, new BigDecimal("-135.00"));

        List<Transfer> transfers = SettlementUtil.calculateMinTransfers(balances, 2L);

        System.out.println("\n四人结算测试:");
        for (Transfer t : transfers) {
            System.out.printf("用户%d 转给 用户%d: %.2f元%n", t.getFromUserId(), t.getToUserId(), t.getAmount());
        }
        System.out.println("转账次数: " + transfers.size());
        assert transfers.size() <= 3;
    }

    public static void main(String[] args) {
        SettlementUtilTest test = new SettlementUtilTest();
        test.testTwoUsers();
        test.testFourUsers();
        System.out.println("\n测试通过!");
    }
}
