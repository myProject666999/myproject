package com.travel.expense.repository;

import com.travel.expense.entity.BillSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface BillSplitRepository extends JpaRepository<BillSplit, Long> {

    List<BillSplit> findByBillId(Long billId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BillSplit bs WHERE bs.billId = :billId")
    void deleteByBillId(@Param("billId") Long billId);

}
