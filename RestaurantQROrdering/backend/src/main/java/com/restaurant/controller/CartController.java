package com.restaurant.controller;

import com.restaurant.dto.CartItem;
import com.restaurant.dto.Result;
import com.restaurant.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @PostMapping("/add")
    public Result<Void> addToCart(@RequestParam Long dishId, @RequestParam Integer quantity, HttpServletRequest request) {
        String sessionId = getSessionId(request);
        cartService.addToCart(sessionId, dishId, quantity);
        return Result.success();
    }
    
    @PutMapping("/update")
    public Result<Void> updateQuantity(@RequestParam Long dishId, @RequestParam Integer quantity, HttpServletRequest request) {
        String sessionId = getSessionId(request);
        cartService.updateQuantity(sessionId, dishId, quantity);
        return Result.success();
    }
    
    @DeleteMapping("/remove/{dishId}")
    public Result<Void> removeFromCart(@PathVariable Long dishId, HttpServletRequest request) {
        String sessionId = getSessionId(request);
        cartService.removeFromCart(sessionId, dishId);
        return Result.success();
    }
    
    @DeleteMapping("/clear")
    public Result<Void> clearCart(HttpServletRequest request) {
        String sessionId = getSessionId(request);
        cartService.clearCart(sessionId);
        return Result.success();
    }
    
    @GetMapping
    public Result<List<CartItem>> getCart(HttpServletRequest request) {
        String sessionId = getSessionId(request);
        return Result.success(cartService.getCart(sessionId));
    }
    
    @GetMapping("/summary")
    public Result<Map<String, Object>> getCartSummary(HttpServletRequest request) {
        String sessionId = getSessionId(request);
        return Result.success(cartService.getCartSummary(sessionId));
    }
    
    private String getSessionId(HttpServletRequest request) {
        return request.getSession().getId();
    }
}
