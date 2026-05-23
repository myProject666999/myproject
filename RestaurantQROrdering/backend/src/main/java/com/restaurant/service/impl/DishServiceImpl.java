package com.restaurant.service.impl;

import com.restaurant.entity.Category;
import com.restaurant.entity.Dish;
import com.restaurant.repository.CategoryRepository;
import com.restaurant.repository.DishRepository;
import com.restaurant.service.DishService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DishServiceImpl implements DishService {
    
    private final DishRepository dishRepository;
    private final CategoryRepository categoryRepository;
    
    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findByStatusOrderBySortOrderAsc(1);
    }
    
    @Override
    public List<Dish> getDishesByCategory(Long categoryId) {
        List<Dish> dishes = dishRepository.findByCategoryIdAndStatus(categoryId, 1);
        dishes.forEach(dish -> {
            Category category = categoryRepository.findById(dish.getCategoryId()).orElse(null);
            if (category != null) {
                dish.setCategoryName(category.getName());
            }
        });
        return dishes;
    }
    
    @Override
    public List<Dish> getAllDishes() {
        List<Dish> dishes = dishRepository.findAll();
        dishes.forEach(dish -> {
            Category category = categoryRepository.findById(dish.getCategoryId()).orElse(null);
            if (category != null) {
                dish.setCategoryName(category.getName());
            }
        });
        return dishes;
    }
    
    @Override
    public Dish getDishById(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));
        Category category = categoryRepository.findById(dish.getCategoryId()).orElse(null);
        if (category != null) {
            dish.setCategoryName(category.getName());
        }
        return dish;
    }
    
    @Override
    @Transactional
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }
    
    @Override
    @Transactional
    public Category updateCategory(Long id, Category category) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        existing.setName(category.getName());
        existing.setSortOrder(category.getSortOrder());
        existing.setIcon(category.getIcon());
        existing.setStatus(category.getStatus());
        return categoryRepository.save(existing);
    }
    
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        List<Dish> dishes = dishRepository.findByCategoryIdAndStatus(id, 1);
        if (!dishes.isEmpty()) {
            throw new RuntimeException("该分类下还有菜品，无法删除");
        }
        categoryRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public Dish createDish(Dish dish) {
        return dishRepository.save(dish);
    }
    
    @Override
    @Transactional
    public Dish updateDish(Long id, Dish dish) {
        Dish existing = getDishById(id);
        existing.setCategoryId(dish.getCategoryId());
        existing.setName(dish.getName());
        existing.setDescription(dish.getDescription());
        existing.setPrice(dish.getPrice());
        existing.setImage(dish.getImage());
        existing.setStock(dish.getStock());
        existing.setStatus(dish.getStatus());
        existing.setRecommend(dish.getRecommend());
        return dishRepository.save(existing);
    }
    
    @Override
    @Transactional
    public void deleteDish(Long id) {
        dishRepository.deleteById(id);
    }
}
