package com.example.incomeexpenditure.mapper;

import com.example.incomeexpenditure.entity.Category;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface CategoryMapper {
    List<Category> findAll();
    List<Category> findByType(@Param("type") Integer type);
    Category findById(@Param("id") Long id);
}
