package com.gtd.repository;

import com.gtd.entity.InboxItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InboxItemRepository extends JpaRepository<InboxItem, Long> {
    List<InboxItem> findByUserIdAndProcessedFalseOrderBySortOrderAscCreatedAtDesc(Long userId);
    List<InboxItem> findByUserIdOrderBySortOrderAscCreatedAtDesc(Long userId);
}
