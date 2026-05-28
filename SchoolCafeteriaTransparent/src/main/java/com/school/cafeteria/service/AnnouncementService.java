package com.school.cafeteria.service;

import com.school.cafeteria.entity.Announcement;
import com.school.cafeteria.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String ANNOUNCEMENT_CACHE_KEY = "announcement:list";

    public Announcement save(Announcement announcement) {
        if (announcement.getPublishTime() == null) {
            announcement.setPublishTime(LocalDateTime.now());
        }
        Announcement saved = announcementRepository.save(announcement);
        clearCache();
        return saved;
    }

    public Optional<Announcement> findById(Long id) {
        Optional<Announcement> announcement = announcementRepository.findById(id);
        announcement.ifPresent(a -> {
            a.setViewCount(a.getViewCount() + 1);
            announcementRepository.save(a);
        });
        return announcement;
    }

    public List<Announcement> findAllPublished() {
        List<Announcement> list = (List<Announcement>) redisTemplate.opsForValue().get(ANNOUNCEMENT_CACHE_KEY);
        if (list == null) {
            list = announcementRepository.findAllPublished();
            redisTemplate.opsForValue().set(ANNOUNCEMENT_CACHE_KEY, list, 30, TimeUnit.MINUTES);
        }
        return list;
    }

    public List<Announcement> findAll() {
        return announcementRepository.findAll();
    }

    public List<Announcement> findByType(String type) {
        return announcementRepository.findByType(type);
    }

    public void delete(Long id) {
        announcementRepository.deleteById(id);
        clearCache();
    }

    private void clearCache() {
        redisTemplate.delete(ANNOUNCEMENT_CACHE_KEY);
    }
}
