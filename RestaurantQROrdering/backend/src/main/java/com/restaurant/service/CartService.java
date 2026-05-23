package com.restaurant.service;

import com.restaurant.dto.CartItem;
import java.util.List;
import java.util.Map;

public interface CartService {
    void addToCart(String sessionId, Long dishId, Integer quantity);
    void updateQuantity(String sessionId, Long dishId, Integer quantity);
    void removeFromCart(String sessionId, Long dishId);
    void clearCart(String sessionId);
    List<CartItem> getCart(String sessionId);
    Map<String, Object> getCartSummary(String sessionId);
}
