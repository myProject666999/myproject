package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.FamilyGroup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FamilyGroupMapper extends BaseMapper<FamilyGroup> {

    @Select("SELECT fg.* FROM family_group fg " +
            "INNER JOIN family_member fm ON fg.id = fm.family_id " +
            "WHERE fm.user_id = #{userId} AND fm.status = 1 AND fg.status = 1")
    List<FamilyGroup> selectByUserId(Long userId);
}
