package com.family.shoppinglist.service;

import com.family.shoppinglist.entity.Category;
import com.family.shoppinglist.entity.PurchaseRecord;
import com.family.shoppinglist.entity.ShoppingItem;
import com.family.shoppinglist.entity.ShoppingList;
import com.family.shoppinglist.repository.PurchaseRecordRepository;
import com.family.shoppinglist.repository.ShoppingItemRepository;
import com.family.shoppinglist.repository.ShoppingListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ShoppingListService {

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private ShoppingItemRepository shoppingItemRepository;

    @Autowired
    private PurchaseRecordRepository purchaseRecordRepository;

    public List<ShoppingList> findAllTemplates() {
        return shoppingListRepository.findByIsTemplate(true);
    }

    public ShoppingList findById(Long id) {
        return shoppingListRepository.findByIdWithItems(id).orElse(null);
    }

    public ShoppingList getActiveList() {
        List<ShoppingList> lists = shoppingListRepository.findByIsTemplate(false);
        return lists.isEmpty() ? null : lists.get(0);
    }

    @Transactional
    public ShoppingList createTemplate(String name) {
        ShoppingList template = new ShoppingList();
        template.setName(name);
        template.setIsTemplate(true);
        return shoppingListRepository.save(template);
    }

    @Transactional
    public ShoppingItem addItem(Long listId, ShoppingItem item) {
        ShoppingList list = shoppingListRepository.findById(listId).orElseThrow(() -> new RuntimeException("List not found"));
        item.setShoppingList(list);
        return shoppingItemRepository.save(item);
    }

    @Transactional
    public ShoppingItem updateItem(Long itemId, ShoppingItem item) {
        ShoppingItem existing = shoppingItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        existing.setName(item.getName());
        existing.setCategory(item.getCategory());
        existing.setQuantity(item.getQuantity());
        existing.setPurchased(item.getPurchased());
        existing.setPrice(item.getPrice());
        existing.setNote(item.getNote());
        return shoppingItemRepository.save(existing);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        shoppingItemRepository.deleteById(itemId);
    }

    @Transactional
    public void togglePurchased(Long itemId) {
        ShoppingItem item = shoppingItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setPurchased(!item.getPurchased());
        shoppingItemRepository.save(item);

        if (item.getPurchased() && item.getPrice() != null) {
            PurchaseRecord record = new PurchaseRecord();
            record.setItemName(item.getName());
            record.setCategory(item.getCategory());
            record.setPrice(item.getPrice());
            record.setPurchaseDate(LocalDate.now());
            purchaseRecordRepository.save(record);
        }
    }

    @Transactional
    public ShoppingList applyTemplate(Long templateId) {
        ShoppingList template = shoppingListRepository.findByIdWithItems(templateId).orElseThrow(() -> new RuntimeException("Template not found"));
        ShoppingList activeList = getActiveList();

        if (activeList == null) {
            activeList = new ShoppingList();
            activeList.setName("当前购物清单");
            activeList.setIsTemplate(false);
            activeList = shoppingListRepository.save(activeList);
        }

        shoppingItemRepository.deleteByShoppingListId(activeList.getId());

        if (template.getItems() != null) {
            for (ShoppingItem templateItem : template.getItems()) {
                ShoppingItem newItem = new ShoppingItem();
                newItem.setName(templateItem.getName());
                newItem.setCategory(templateItem.getCategory());
                newItem.setQuantity(templateItem.getQuantity());
                newItem.setNote(templateItem.getNote());
                newItem.setShoppingList(activeList);
                shoppingItemRepository.save(newItem);
            }
        }

        return shoppingListRepository.findByIdWithItems(activeList.getId()).orElse(null);
    }

    @Transactional
    public void saveAsTemplate(Long listId, String templateName) {
        ShoppingList sourceList = shoppingListRepository.findByIdWithItems(listId).orElseThrow(() -> new RuntimeException("List not found"));

        ShoppingList template = new ShoppingList();
        template.setName(templateName);
        template.setIsTemplate(true);
        template = shoppingListRepository.save(template);

        if (sourceList.getItems() != null) {
            for (ShoppingItem sourceItem : sourceList.getItems()) {
                ShoppingItem templateItem = new ShoppingItem();
                templateItem.setName(sourceItem.getName());
                templateItem.setCategory(sourceItem.getCategory());
                templateItem.setQuantity(sourceItem.getQuantity());
                templateItem.setNote(sourceItem.getNote());
                templateItem.setShoppingList(template);
                shoppingItemRepository.save(templateItem);
            }
        }
    }

    @Transactional
    public void deleteList(Long id) {
        shoppingListRepository.deleteById(id);
    }

    @Transactional
    public void clearPurchasedItems(Long listId) {
        List<ShoppingItem> items = shoppingItemRepository.findByShoppingListId(listId);
        List<ShoppingItem> toDelete = new ArrayList<>();
        for (ShoppingItem item : items) {
            if (Boolean.TRUE.equals(item.getPurchased())) {
                toDelete.add(item);
            }
        }
        shoppingItemRepository.deleteAll(toDelete);
    }
}
