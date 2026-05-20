package com.travel.service;

import com.travel.entity.PackingItem;
import com.travel.repository.PackingItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PackingItemService {

    @Autowired
    private PackingItemRepository packingItemRepository;

    public List<PackingItem> findByTripId(Long tripId) {
        return packingItemRepository.findByTripId(tripId);
    }

    public Optional<PackingItem> findById(Long id) {
        return packingItemRepository.findById(id);
    }

    public PackingItem save(PackingItem packingItem) {
        return packingItemRepository.save(packingItem);
    }

    public void deleteById(Long id) {
        packingItemRepository.deleteById(id);
    }
}
