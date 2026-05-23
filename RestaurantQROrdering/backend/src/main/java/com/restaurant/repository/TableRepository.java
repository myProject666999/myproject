package com.restaurant.repository;

import com.restaurant.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TableRepository extends JpaRepository<DiningTable, Long> {
    Optional<DiningTable> findByTableNo(String tableNo);
}
