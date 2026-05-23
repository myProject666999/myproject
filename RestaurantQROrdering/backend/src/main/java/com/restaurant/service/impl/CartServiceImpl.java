package com.restaurant.service.impl;

import com.restaurant.dto.CartItem;
import com.restaurant.entity.Dish;
import com.restaurant.repository.DishRepository;
import com.restaurant.service.CartService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    
    private final StringRedisTemplate redisTemplate;
    private final DishRepository dishRepository;
    private final ObjectMapper objectMapper;
    
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
        List<CartItem> cart = getCartFromRedis(key);
        
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
        
        saveCartToRedis(key, cart);
    }
    
    @Override
    @Transactional
    public void updateQuantity(String sessionId, Long dishId, Integer quantity) {
        String key = cartPrefix + sessionId;
        List<CartItem> cart = getCartFromRedis(key);
        
        cart.stream()
                .filter(item -> item.getDishId().equals(dishId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        
        cart.removeIf(item -> item.getQuantity() <= 0);
        
        saveCartToRedis(key, cart);
    }
    
    @Override
    @Transactional
    public void removeFromCart(String sessionId, Long dishId) {
        String key = cartPrefix + sessionId;
        List<CartItem> cart = getCartFromRedis(key);
        cart.removeIf(item -> item.getDishId().equals(dishId));
        saveCartToRedis(key, cart);
    }
    
    @Override
    @Transactional
    public void clearCart(String sessionId) {
        String key = cartPrefix + sessionId;
        redisTemplate.delete(key);
    }
    
    @Override
    public List<CartItem> getCart(String sessionId) {
        String key = cartPrefix + sessionId;
        return getCartFromRedis(key);
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
    
    private List<CartItem> getCartFromRedis(String key) {
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<CartItem>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private void saveCartToRedis(String key, List<CartItem> cart) {
        try {
            String json = objectMapper.writeValueAsString(cart);
            redisTemplate.opsForValue().set(key, json, expireHours, TimeUnit.HOURS);
        } catch (Exception e) {
            throw new RuntimeException("保存购物车失败", e);
        }
    }
}
