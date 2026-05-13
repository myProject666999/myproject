package com.chess.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chess.entity.TableInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TableInfoMapper extends BaseMapper<TableInfo> {

    @Select("SELECT t.*, ty.name as type_name, ty.hourly_rate as hourly_rate " +
            "FROM table_info t LEFT JOIN table_type ty ON t.type_id = ty.id")
    List<TableInfo> selectListWithType();
}
