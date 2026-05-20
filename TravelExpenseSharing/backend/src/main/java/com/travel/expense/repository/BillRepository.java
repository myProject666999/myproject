package com.travel.expense.repository;

import com.travel.expense.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.splits ORDER BY b.billDate DESC, b.createdAt DESC")
    List<Bill> findAllWithSplits();

}
