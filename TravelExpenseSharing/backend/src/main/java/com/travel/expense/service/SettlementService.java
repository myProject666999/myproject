package com.travel.expense.service;

import com.travel.expense.dto.*;
import com.travel.expense.entity.Bill;
import com.travel.expense.entity.BillSplit;
import com.travel.expense.entity.User;
import com.travel.expense.repository.BillRepository;
import com.travel.expense.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private UserRepository userRepository;

    public DebtMatrixDTO getDebtMatrix() {
        List<User> users = userRepository.findAll();
        int n = users.size();
        
        List<List<BigDecimal>> matrix = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            List<BigDecimal> row = new ArrayList<>();
            for (int j = 0; j < n; j++) {
                row.add(BigDecimal.ZERO);
            }
            matrix.add(row);
        }
        
        Map<Long, Integer> userIdToIndex = new HashMap<>();
        for (int i = 0; i < n; i++) {
            userIdToIndex.put(users.get(i).getId(), i);
        }
        
        List<Bill> bills = billRepository.findAllWithSplits();
        
        for (Bill bill : bills) {
            int payerIndex = userIdToIndex.get(bill.getPayerId());
            
            for (BillSplit split : bill.getSplits()) {
                int participantIndex = userIdToIndex.get(split.getParticipantId());
                if (participantIndex != payerIndex) {
                    BigDecimal current = matrix.get(participantIndex).get(payerIndex);
                    matrix.get(participantIndex).set(payerIndex, 
                        current.add(split.getSplitAmount()));
                }
            }
        }
        
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i != j) {
                    BigDecimal iToJ = matrix.get(i).get(j);
                    BigDecimal jToI = matrix.get(j).get(i);
                    BigDecimal net = iToJ.subtract(jToI);
                    if (net.compareTo(BigDecimal.ZERO) > 0) {
                        matrix.get(i).set(j, net);
                        matrix.get(j).set(i, BigDecimal.ZERO);
                    } else {
                        matrix.get(i).set(j, BigDecimal.ZERO);
                        matrix.get(j).set(i, net.negate());
                    }
                }
            }
        }
        
        DebtMatrixDTO debtMatrixDTO = new DebtMatrixDTO();
        debtMatrixDTO.setUsers(users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            BeanUtils.copyProperties(user, dto);
            return dto;
        }).collect(Collectors.toList()));
        debtMatrixDTO.setMatrix(matrix);
        
        return debtMatrixDTO;
    }

    public TransferPlanDTO getTransferPlan() {
        List<User> users = userRepository.findAll();
        Map<Long, BigDecimal> balanceMap = new HashMap<>();
        
        for (User user : users) {
            balanceMap.put(user.getId(), BigDecimal.ZERO);
        }
        
        List<Bill> bills = billRepository.findAllWithSplits();
        
        for (Bill bill : bills) {
            Long payerId = bill.getPayerId();
            balanceMap.put(payerId, balanceMap.get(payerId).add(bill.getAmount()));
            
            for (BillSplit split : bill.getSplits()) {
                Long participantId = split.getParticipantId();
                balanceMap.put(participantId, 
                    balanceMap.get(participantId).subtract(split.getSplitAmount()));
            }
        }
        
        PriorityQueue<Map.Entry<Long, BigDecimal>> debtors = new PriorityQueue<>(
            (a, b) -> a.getValue().compareTo(b.getValue()));
        PriorityQueue<Map.Entry<Long, BigDecimal>> creditors = new PriorityQueue<>(
            (a, b) -> b.getValue().compareTo(a.getValue()));
        
        for (Map.Entry<Long, BigDecimal> entry : balanceMap.entrySet()) {
            BigDecimal balance = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.offer(new AbstractMap.SimpleEntry<>(entry.getKey(), balance));
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.offer(new AbstractMap.SimpleEntry<>(entry.getKey(), balance));
            }
        }
        
        List<TransferDTO> transfers = new ArrayList<>();
        Map<Long, String> userNameMap = users.stream()
            .collect(Collectors.toMap(User::getId, User::getName));
        
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            Map.Entry<Long, BigDecimal> debtor = debtors.poll();
            Map.Entry<Long, BigDecimal> creditor = creditors.poll();
            
            BigDecimal debtorAmount = debtor.getValue().abs().setScale(2, RoundingMode.HALF_UP);
            BigDecimal creditorAmount = creditor.getValue().setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal transferAmount = debtorAmount.min(creditorAmount);
            
            transfers.add(new TransferDTO(
                debtor.getKey(),
                userNameMap.get(debtor.getKey()),
                creditor.getKey(),
                userNameMap.get(creditor.getKey()),
                transferAmount
            ));
            
            BigDecimal remainingDebt = debtorAmount.subtract(transferAmount);
            BigDecimal remainingCredit = creditorAmount.subtract(transferAmount);
            
            if (remainingDebt.compareTo(BigDecimal.ZERO) > 0) {
                debtors.offer(new AbstractMap.SimpleEntry<>(
                    debtor.getKey(), remainingDebt.negate()));
            }
            
            if (remainingCredit.compareTo(BigDecimal.ZERO) > 0) {
                creditors.offer(new AbstractMap.SimpleEntry<>(
                    creditor.getKey(), remainingCredit));
            }
        }
        
        TransferPlanDTO planDTO = new TransferPlanDTO();
        planDTO.setTotalTransfers(transfers.size());
        planDTO.setTransfers(transfers);
        
        return planDTO;
    }

}
