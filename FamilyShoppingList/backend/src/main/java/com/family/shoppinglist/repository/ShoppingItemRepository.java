package com.family.shoppinglist.repository;

import com.family.shoppinglist.entity.ShoppingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    List<ShoppingItem> findByShoppingListId(Long listId);

    void deleteByShoppingListId(Long listId);
}
