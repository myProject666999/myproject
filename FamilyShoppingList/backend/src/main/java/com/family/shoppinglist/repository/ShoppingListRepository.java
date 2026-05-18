package com.family.shoppinglist.repository;

import com.family.shoppinglist.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {

    List<ShoppingList> findByIsTemplate(Boolean isTemplate);

    @Query("SELECT s FROM ShoppingList s LEFT JOIN FETCH s.items i LEFT JOIN FETCH i.category WHERE s.id = :id")
    Optional<ShoppingList> findByIdWithItems(Long id);
}
