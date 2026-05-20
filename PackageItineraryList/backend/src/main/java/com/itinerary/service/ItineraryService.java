package com.itinerary.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.itinerary.entity.Itinerary;
import com.itinerary.entity.ItineraryItem;

import java.util.List;

public interface ItineraryService extends IService<Itinerary> {
    List<Itinerary> getUserItineraries(Long userId);
    Itinerary createItinerary(Itinerary itinerary, Long templateId, Long userId);
    List<ItineraryItem> getItineraryItems(Long itineraryId);
    ItineraryItem addCustomItem(Long itineraryId, ItineraryItem item);
    boolean checkItem(Long itemId, boolean checked);
    boolean deleteItineraryItem(Long itemId);
}
