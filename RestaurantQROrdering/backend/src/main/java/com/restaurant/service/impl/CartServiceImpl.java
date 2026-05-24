package com.restaurant.service.impl;

import com.restaurant.dto.CartItem;
import com.restaurant.entity.Dish;
import com.restaurant.repository.DishRepository;
import com.restaurant.service.CartService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    
    private final StringRedisTemplate redisTemplate;
    private final DishRepository dishRepository;
    private final ObjectMapper objectMapper;
    
    private final Map<String, List<CartItem>> fallbackCartStore = new ConcurrentHashMap<>();
    
    @Value("${app.cart.prefix}")
    private String cartPrefix;
    
    @Value("${app.cart.expire-hours}")
    private Integer expireHours;
    
    @Override
    @Transactional
    public void addToCart(String sessionId, Long dishId, Integer quantity) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));
        
        if (dish.getStatus() != 1) {
            throw new RuntimeException("菜品已下架");
        }
        
        String key = cartPrefix + sessionId;
        List<CartItem> cart = getCartFromStorage(key);
        
        Optional<CartItem> existingItem = cart.stream()
                .filter(item -> item.getDishId().equals(dishId))
                .findFirst();
        
        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            CartItem item = new CartItem();
            item.setDishId(dish.getId());
            item.setDishName(dish.getName());
            item.setPrice(dish.getPrice());
            item.setQuantity(quantity);
            item.setImage(dish.getImage());
            cart.add(item);
        }
        
        saveCartToStorage(key, cart);
        log.debug("添加购物车成功: sessionId={}, dishId={}, quantity={}", sessionId, dishId, quantity);
    }
    
    @Override
    @Transactional
    public void updateQuantity(String sessionId, Long dishId, Integer quantity) {
        String key = cartPrefix + sessionId;
        List<CartItem> cart = getCartFromStorage(key);
        
        cart.stream()
                .filter(item -> item.getDishId().equals(dishId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        
        cart.removeIf(item -> item.getQuantity() <= 0);
        
        saveCartToStorage(key, cart);
    }
    
    @Override
    @Transactional
    public void removeFromCart(String sessionId, Long dishId) {
        String key = cartPrefix + sessionId;
        List<CartItem> cart = getCartFromStorage(key);
        cart.removeIf(item -> item.getDishId().equals(dishId));
        saveCartToStorage(key, cart);
    }
    
    @Override
    @Transactional
    public void clearCart(String sessionId) {
        String key = cartPrefix + sessionId;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis删除失败，使用内存缓存: {}", e.getMessage());
        }
        fallbackCartStore.remove(key);
    }
    
    @Override
    public List<CartItem> getCart(String sessionId) {
        String key = cartPrefix + sessionId;
        return getCartFromStorage(key);
    }
    
    @Override
    public Map<String, Object> getCartSummary(String sessionId) {
        List<CartItem> cart = getCart(sessionId);
        BigDecimal totalAmount = cart.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalCount = cart.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("items", cart);
        summary.put("totalAmount", totalAmount);
        summary.put("totalCount", totalCount);
        return summary;
    }
    
    private List<CartItem> getCartFromStorage(String key) {
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return fallbackCartStore.getOrDefault(key, new ArrayList<>());
            }
            return objectMapper.readValue(json, new TypeReference<List<CartItem>>() {});
        } catch (Exception e) {
            log.warn("Redis读取失败，使用内存缓存: {}", e.getMessage());
            return fallbackCartStore.getOrDefault(key, new ArrayList<>());
        }
    }
    
    private void saveCartToStorage(String key, List<CartItem> cart) {
        try {
            String json = objectMapper.writeValueAsString(cart);
            redisTemplate.opsForValue().set(key, json, expireHours, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Redis保存失败，使用内存缓存: {}", e.getMessage());
        }
        fallbackCartStore.put(key, cart);
    }
}
