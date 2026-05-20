package com.travel.controller;

import com.travel.entity.DailySchedule;
import com.travel.service.DailyScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/daily-schedules")
@CrossOrigin(origins = "*")
public class DailyScheduleController {

    @Autowired
    private DailyScheduleService dailyScheduleService;

    @GetMapping("/trip/{tripId}")
    public List<DailySchedule> findByTripId(@PathVariable Long tripId) {
        return dailyScheduleService.findByTripId(tripId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DailySchedule> findById(@PathVariable Long id) {
        return dailyScheduleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DailySchedule create(@RequestBody DailySchedule dailySchedule) {
        return dailyScheduleService.save(dailySchedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailySchedule> update(@PathVariable Long id, @RequestBody DailySchedule dailySchedule) {
        return dailyScheduleService.findById(id)
                .map(existing -> {
                    dailySchedule.setId(id);
                    return ResponseEntity.ok(dailyScheduleService.save(dailySchedule));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return dailyScheduleService.findById(id)
                .map(schedule -> {
                    dailyScheduleService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
