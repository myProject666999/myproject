package com.restaurant.service;

import com.restaurant.entity.Category;
import com.restaurant.entity.Dish;
import java.util.List;

public interface DishService {
    List<Category> getAllCategories(boolean all);
    List<Dish> getDishesByCategory(Long categoryId);
    List<Dish> getAllDishes();
    Dish getDishById(Long id);
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    Dish createDish(Dish dish);
    Dish updateDish(Long id, Dish dish);
    void deleteDish(Long id);
}
