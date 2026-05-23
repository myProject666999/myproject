package com.restaurant.repository;

import com.restaurant.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByCategoryIdAndStatus(Long categoryId, Integer status);
    List<Dish> findByStatus(Integer status);
    
    @Modifying
    @Query("UPDATE Dish d SET d.stock = d.stock - :quantity WHERE d.id = :id AND d.stock >= :quantity")
    int decreaseStock(Long id, Integer quantity);
    
    @Modifying
    @Query("UPDATE Dish d SET d.stock = d.stock + :quantity WHERE d.id = :id")
    int increaseStock(Long id, Integer quantity);
    
    @Modifying
    @Query("UPDATE Dish d SET d.sales = d.sales + :quantity WHERE d.id = :id")
    int increaseSales(Long id, Integer quantity);
}
