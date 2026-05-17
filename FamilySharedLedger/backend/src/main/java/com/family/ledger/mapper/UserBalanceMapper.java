package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.UserBalance;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserBalanceMapper extends BaseMapper<UserBalance> {

    @Select("SELECT * FROM user_balance WHERE family_id = #{familyId}")
    List<UserBalance> selectByFamilyId(Long familyId);

    @Select("SELECT * FROM user_balance WHERE user_id = #{userId}")
    List<UserBalance> selectByUserId(Long userId);

    @Select("SELECT * FROM user_balance WHERE family_id = #{familyId} AND user_id = #{userId}")
    UserBalance selectByFamilyIdAndUserId(Long familyId, Long userId);
}
