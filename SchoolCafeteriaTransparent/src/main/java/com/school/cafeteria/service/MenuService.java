package com.school.cafeteria.service;

import com.school.cafeteria.entity.Menu;
import com.school.cafeteria.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String MENU_CACHE_KEY = "menu:";

    public List<Menu> getMenuByDate(LocalDate date) {
        String cacheKey = MENU_CACHE_KEY + date;
        List<Menu> menus = (List<Menu>) redisTemplate.opsForValue().get(cacheKey);
        if (menus == null) {
            menus = menuRepository.findByMenuDateOrderByMealType(date);
            redisTemplate.opsForValue().set(cacheKey, menus, 1, TimeUnit.HOURS);
        }
        return menus;
    }

    public List<Menu> getMenuByDateAndMealType(LocalDate date, String mealType) {
        return menuRepository.findByMenuDateAndMealType(date, mealType);
    }

    public List<Menu> getMenuByDateRange(LocalDate startDate, LocalDate endDate) {
        return menuRepository.findByDateRange(startDate, endDate);
    }

    public Menu saveMenu(Menu menu) {
        Menu saved = menuRepository.save(menu);
        redisTemplate.delete(MENU_CACHE_KEY + menu.getMenuDate());
        return saved;
    }

    public Optional<Menu> getMenuById(Long id) {
        return menuRepository.findById(id);
    }

    public void deleteMenu(Long id) {
        Optional<Menu> menu = menuRepository.findById(id);
        menu.ifPresent(m -> {
            menuRepository.deleteById(id);
            redisTemplate.delete(MENU_CACHE_KEY + m.getMenuDate());
        });
    }

    public List<Menu> saveAllMenus(List<Menu> menus) {
        return menuRepository.saveAll(menus);
    }
}
