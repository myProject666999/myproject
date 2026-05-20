package com.travel.expense.service;

import com.travel.expense.dto.BillDTO;
import com.travel.expense.dto.BillSplitDTO;
import com.travel.expense.entity.Bill;
import com.travel.expense.entity.BillSplit;
import com.travel.expense.repository.BillRepository;
import com.travel.expense.repository.BillSplitRepository;
import com.travel.expense.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillSplitRepository billSplitRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BillDTO> getAllBills() {
        return billRepository.findAllWithSplits().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BillDTO getBillById(Long id) {
        return billRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public BillDTO createBill(BillDTO billDTO) {
        Bill bill = new Bill();
        bill.setTitle(billDTO.getTitle());
        bill.setAmount(billDTO.getAmount());
        bill.setPayerId(billDTO.getPayerId());
        bill.setBillDate(billDTO.getBillDate());
        bill.setRemark(billDTO.getRemark());
        
        Bill savedBill = billRepository.save(bill);
        
        for (BillSplitDTO splitDTO : billDTO.getSplits()) {
            BillSplit split = new BillSplit();
            split.setBillId(savedBill.getId());
            split.setParticipantId(splitDTO.getParticipantId());
            split.setSplitRatio(splitDTO.getSplitRatio());
            split.setSplitAmount(splitDTO.getSplitAmount());
            billSplitRepository.save(split);
        }
        
        return convertToDTO(savedBill);
    }

    @Transactional
    public BillDTO updateBill(Long id, BillDTO billDTO) {
        return billRepository.findById(id).map(bill -> {
            bill.setTitle(billDTO.getTitle());
            bill.setAmount(billDTO.getAmount());
            bill.setPayerId(billDTO.getPayerId());
            bill.setBillDate(billDTO.getBillDate());
            bill.setRemark(billDTO.getRemark());
            
            billSplitRepository.deleteByBillId(id);
            
            for (BillSplitDTO splitDTO : billDTO.getSplits()) {
                BillSplit split = new BillSplit();
                split.setBillId(bill.getId());
                split.setParticipantId(splitDTO.getParticipantId());
                split.setSplitRatio(splitDTO.getSplitRatio());
                split.setSplitAmount(splitDTO.getSplitAmount());
                billSplitRepository.save(split);
            }
            
            Bill savedBill = billRepository.save(bill);
            return convertToDTO(savedBill);
        }).orElse(null);
    }

    @Transactional
    public boolean deleteBill(Long id) {
        if (billRepository.existsById(id)) {
            billSplitRepository.deleteByBillId(id);
            billRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private BillDTO convertToDTO(Bill bill) {
        BillDTO dto = new BillDTO();
        BeanUtils.copyProperties(bill, dto);
        
        userRepository.findById(bill.getPayerId()).ifPresent(user -> {
            dto.setPayerName(user.getName());
        });
        
        List<BillSplitDTO> splits = bill.getSplits().stream().map(split -> {
            BillSplitDTO splitDTO = new BillSplitDTO();
            BeanUtils.copyProperties(split, splitDTO);
            userRepository.findById(split.getParticipantId()).ifPresent(user -> {
                splitDTO.setParticipantName(user.getName());
            });
            return splitDTO;
        }).collect(Collectors.toList());
        dto.setSplits(splits);
        
        return dto;
    }

}
