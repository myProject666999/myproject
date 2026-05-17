package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.FamilyMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FamilyMemberMapper extends BaseMapper<FamilyMember> {

    @Select("SELECT * FROM family_member WHERE family_id = #{familyId} AND status = 1")
    List<FamilyMember> selectByFamilyId(Long familyId);
}
