package com.gtd.service;

import com.gtd.entity.InboxItem;
import com.gtd.repository.InboxItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InboxItemService {

    @Autowired
    private InboxItemRepository inboxItemRepository;

    public List<InboxItem> getUnprocessedItems(Long userId) {
        return inboxItemRepository.findByUserIdAndProcessedFalseOrderBySortOrderAscCreatedAtDesc(userId);
    }

    public List<InboxItem> getAllItems(Long userId) {
        return inboxItemRepository.findByUserIdOrderBySortOrderAscCreatedAtDesc(userId);
    }

    public InboxItem createItem(InboxItem item) {
        return inboxItemRepository.save(item);
    }

    public Optional<InboxItem> getItemById(Long id) {
        return inboxItemRepository.findById(id);
    }

    public InboxItem updateItem(InboxItem item) {
        return inboxItemRepository.save(item);
    }

    @Transactional
    public void markAsProcessed(Long id) {
        inboxItemRepository.findById(id).ifPresent(item -> {
            item.setProcessed(true);
            inboxItemRepository.save(item);
        });
    }

    @Transactional
    public void updateSortOrder(List<Long> itemIds) {
        for (int i = 0; i < itemIds.size(); i++) {
            Long id = itemIds.get(i);
            inboxItemRepository.findById(id).ifPresent(item -> {
                item.setSortOrder(i);
                inboxItemRepository.save(item);
            });
        }
    }

    public void deleteItem(Long id) {
        inboxItemRepository.deleteById(id);
    }
}
