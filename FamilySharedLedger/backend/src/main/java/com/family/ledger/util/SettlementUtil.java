package com.family.ledger.util;

import com.family.ledger.entity.Transfer;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class SettlementUtil {

    private static final BigDecimal EPSILON = new BigDecimal("0.01");

    public static List<Transfer> calculateMinTransfers(Map<Long, BigDecimal> balances, Long settleId) {
        List<Map.Entry<Long, BigDecimal>> debtors = new ArrayList<>();
        List<Map.Entry<Long, BigDecimal>> creditors = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
            BigDecimal value = entry.getValue();
            if (value.compareTo(EPSILON) < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), value.negate()));
            } else if (value.compareTo(EPSILON) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), value));
            }
        }

        debtors.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        creditors.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        List<Transfer> transfers = new ArrayList<>();
        int i = 0, j = 0;

        while (i < debtors.size() && j < creditors.size()) {
            Map.Entry<Long, BigDecimal> debtor = debtors.get(i);
            Map.Entry<Long, BigDecimal> creditor = creditors.get(j);

            BigDecimal minAmount = debtor.getValue().min(creditor.getValue());

            if (minAmount.compareTo(EPSILON) >= 0) {
                Transfer transfer = new Transfer();
                transfer.setSettleId(settleId);
                transfer.setFromUserId(debtor.getKey());
                transfer.setToUserId(creditor.getKey());
                transfer.setAmount(minAmount.setScale(2, RoundingMode.HALF_UP));
                transfer.setStatus(0);
                transfer.setCreateTime(java.time.LocalDateTime.now());
                transfers.add(transfer);

                debtor.setValue(debtor.getValue().subtract(minAmount));
                creditor.setValue(creditor.getValue().subtract(minAmount));
            }

            if (debtor.getValue().compareTo(EPSILON) < 0) {
                i++;
            }
            if (creditor.getValue().compareTo(EPSILON) < 0) {
                j++;
            }
        }

        return transfers;
    }
}
