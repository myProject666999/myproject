package com.itinerary.controller;

import com.itinerary.common.Result;
import com.itinerary.entity.Itinerary;
import com.itinerary.entity.ItineraryItem;
import com.itinerary.service.ItineraryService;
import com.itinerary.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/itinerary")
@CrossOrigin
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/my")
    public Result<List<Itinerary>> getUserItineraries(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        return Result.success(itineraryService.getUserItineraries(userId));
    }

    @PostMapping
    public Result<Itinerary> createItinerary(@RequestBody Map<String, Object> request,
                                             @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        Itinerary itinerary = new Itinerary();
        itinerary.setName((String) request.get("name"));
        if (request.get("days") != null) {
            itinerary.setDays(Integer.valueOf(request.get("days").toString()));
        }
        itinerary.setDestination((String) request.get("destination"));
        itinerary.setNotes((String) request.get("notes"));
        Long templateId = request.get("templateId") != null ? Long.valueOf(request.get("templateId").toString()) : null;
        return Result.success(itineraryService.createItinerary(itinerary, templateId, userId));
    }

    @GetMapping("/{id}/items")
    public Result<List<ItineraryItem>> getItineraryItems(@PathVariable Long id) {
        return Result.success(itineraryService.getItineraryItems(id));
    }

    @PostMapping("/{id}/items")
    public Result<ItineraryItem> addCustomItem(@PathVariable Long id, @RequestBody ItineraryItem item) {
        return Result.success(itineraryService.addCustomItem(id, item));
    }

    @PutMapping("/items/{itemId}/check")
    public Result<Boolean> checkItem(@PathVariable Long itemId, @RequestBody Map<String, Boolean> request) {
        boolean checked = request.getOrDefault("checked", false);
        return Result.success(itineraryService.checkItem(itemId, checked));
    }

    @DeleteMapping("/items/{itemId}")
    public Result<Boolean> deleteItem(@PathVariable Long itemId) {
        return Result.success(itineraryService.deleteItineraryItem(itemId));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteItinerary(@PathVariable Long id) {
        return Result.success(itineraryService.removeById(id));
    }
}
