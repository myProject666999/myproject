package com.travel.expense.repository;

import com.travel.expense.entity.BillSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillSplitRepository extends JpaRepository<BillSplit, Long> {

    List<BillSplit> findByBillId(Long billId);

    void deleteByBillId(Long billId);

}
