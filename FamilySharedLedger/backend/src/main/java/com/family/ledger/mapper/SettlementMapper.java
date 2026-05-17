package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.Settlement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SettlementMapper extends BaseMapper<Settlement> {

    @Select("SELECT * FROM settlement WHERE family_id = #{familyId} ORDER BY create_time DESC")
    List<Settlement> selectByFamilyId(Long familyId);
}
