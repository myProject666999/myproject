package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.Transfer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TransferMapper extends BaseMapper<Transfer> {

    @Select("SELECT * FROM transfer WHERE settle_id = #{settleId}")
    List<Transfer> selectBySettleId(Long settleId);

    @Select("SELECT * FROM transfer WHERE from_user_id = #{userId} OR to_user_id = #{userId} ORDER BY create_time DESC")
    List<Transfer> selectByUserId(Long userId);

    @Select("SELECT * FROM transfer WHERE (from_user_id = #{userId} OR to_user_id = #{userId}) AND status = #{status} ORDER BY create_time DESC")
    List<Transfer> selectByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Integer status);
}
