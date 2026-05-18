package com.family.shoppinglist.controller;

import com.family.shoppinglist.entity.ShoppingItem;
import com.family.shoppinglist.entity.ShoppingList;
import com.family.shoppinglist.service.ShoppingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lists")
public class ShoppingListController {

    @Autowired
    private ShoppingListService shoppingListService;

    @GetMapping("/active")
    public ShoppingList getActiveList() {
        return shoppingListService.getActiveList();
    }

    @GetMapping("/templates")
    public List<ShoppingList> getTemplates() {
        return shoppingListService.findAllTemplates();
    }

    @GetMapping("/{id}")
    public ShoppingList getById(@PathVariable Long id) {
        return shoppingListService.findById(id);
    }

    @PostMapping("/templates")
    public ShoppingList createTemplate(@RequestBody Map<String, String> body) {
        return shoppingListService.createTemplate(body.get("name"));
    }

    @PostMapping("/{listId}/items")
    public ShoppingItem addItem(@PathVariable Long listId, @RequestBody ShoppingItem item) {
        return shoppingListService.addItem(listId, item);
    }

    @PutMapping("/items/{itemId}")
    public ShoppingItem updateItem(@PathVariable Long itemId, @RequestBody ShoppingItem item) {
        return shoppingListService.updateItem(itemId, item);
    }

    @DeleteMapping("/items/{itemId}")
    public void deleteItem(@PathVariable Long itemId) {
        shoppingListService.deleteItem(itemId);
    }

    @PutMapping("/items/{itemId}/toggle")
    public void togglePurchased(@PathVariable Long itemId) {
        shoppingListService.togglePurchased(itemId);
    }

    @PostMapping("/templates/{templateId}/apply")
    public ShoppingList applyTemplate(@PathVariable Long templateId) {
        return shoppingListService.applyTemplate(templateId);
    }

    @PostMapping("/{listId}/save-as-template")
    public void saveAsTemplate(@PathVariable Long listId, @RequestBody Map<String, String> body) {
        shoppingListService.saveAsTemplate(listId, body.get("name"));
    }

    @DeleteMapping("/{id}")
    public void deleteList(@PathVariable Long id) {
        shoppingListService.deleteList(id);
    }

    @DeleteMapping("/{listId}/clear-purchased")
    public void clearPurchasedItems(@PathVariable Long listId) {
        shoppingListService.clearPurchasedItems(listId);
    }
}
