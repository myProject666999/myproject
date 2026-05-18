package com.family.shoppinglist.config;

import com.family.shoppinglist.entity.Category;
import com.family.shoppinglist.entity.ShoppingList;
import com.family.shoppinglist.repository.CategoryRepository;
import com.family.shoppinglist.repository.ShoppingListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                createCategory("蔬菜", "🥬"),
                createCategory("调料", "🧂"),
                createCategory("日用", "🧴"),
                createCategory("水果", "🍎"),
                createCategory("肉类", "🥩"),
                createCategory("零食", "🍪")
            );
            categoryRepository.saveAll(categories);
        }

        if (shoppingListRepository.findByIsTemplate(false).isEmpty()) {
            ShoppingList list = new ShoppingList();
            list.setName("当前购物清单");
            list.setIsTemplate(false);
            shoppingListRepository.save(list);
        }
    }

    private Category createCategory(String name, String icon) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        return category;
    }
}
